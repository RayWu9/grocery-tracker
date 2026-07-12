"""
Coles price scraper.

Queries the public search page and extracts product information from Next.js state payload.
Bypasses anti-bot protection using curl-cffi and persistent session cookie sharing.
"""

import time
import json
import logging
from bs4 import BeautifulSoup

# Try to import requests from curl_cffi to bypass Incapsula WAF
try:
    from curl_cffi import requests
    USE_CURL_CFFI = True
except ImportError:
    import requests
    USE_CURL_CFFI = False

logger = logging.getLogger(__name__)

HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Module-level persistent session to share cookies across all product searches
_session = None

def get_session():
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update(HEADERS)
    return _session


def search_product(search_term: str, timeout: int = 15, retries: int = 3) -> dict | None:
    """
    Search Coles for a product and return the best-matching result.
    """
    url = f'https://www.coles.com.au/search?q={search_term.replace(" ", "+")}'
    session = get_session()

    for attempt in range(1, retries + 1):
        try:
            if USE_CURL_CFFI:
                resp = session.get(url, impersonate='chrome120', timeout=timeout)
            else:
                resp = session.get(url, timeout=timeout)

            resp.raise_for_status()
            
            # Parse the search page content
            result = _parse_html_page(resp.text, search_term)
            if result:
                return result
                
            # If parse failed or was empty, check if we hit a block page
            if "pardon our interruption" in resp.text.lower():
                logger.warning(f'[Coles] Blocked by Incapsula challenge on attempt {attempt}')
            else:
                logger.warning(f'[Coles] Product not found in search results on attempt {attempt}')

        except Exception as e:
            logger.warning(f'[Coles] Connection/Request error on attempt {attempt}: {e}')

        if attempt < retries:
            # Sleep with exponential backoff on block/failure
            time.sleep(2 ** attempt + 3)

    logger.error(f'[Coles] Failed to fetch "{search_term}" after {retries} attempts')
    return None


def _parse_html_page(html_text: str, search_term: str) -> dict | None:
    """
    Parse Coles HTML search page, prioritizing Next.js JSON state payload.
    """
    soup = BeautifulSoup(html_text, 'lxml')

    # Try parsing Next.js page state (contains clean, raw product data)
    script_tag = soup.find('script', id='__NEXT_DATA__')
    if script_tag:
        try:
            data = json.loads(script_tag.get_text())
            results = data.get('props', {}).get('pageProps', {}).get('searchResults', {}).get('results', [])
            if results:
                # Use first search result
                product = results[0]
                name = product.get('name') or product.get('fullName', '')
                pricing = product.get('pricing', {})

                price = pricing.get('now')
                was_price = pricing.get('was')

                if price is not None:
                    # Default regular price to current price if 'was' price is missing or 0
                    if not was_price or was_price == 0:
                        was_price = price

                    is_on_special = pricing.get('promotionType') == 'SPECIAL' or (was_price > price)
                    discount_pct = None
                    if is_on_special and was_price > price:
                        discount_pct = round((1 - price / was_price) * 100)

                    logger.info(
                        f'[Coles] "{name[:50]}" → ${price:.2f}'
                        + (f' (was ${was_price:.2f}, -{discount_pct}%)' if is_on_special else ' (regular)')
                    )

                    return {
                        'price':         float(price),
                        'regular_price': float(was_price),
                        'on_sale':       bool(is_on_special),
                        'discount_pct':  discount_pct,
                        'name':          name,
                    }
        except Exception as e:
            logger.debug(f'[Coles] Failed to parse NEXT_DATA script block: {e}')

    # HTML Fallback: extract directly from DOM tags if script is blocked or missing
    price_els = soup.select('[data-testid="product-pricing"]')
    if not price_els:
        price_els = soup.select('.price')

    if price_els:
        try:
            price_text = price_els[0].get_text(strip=True)
            import re
            match = re.search(r'[\d,]+\.?\d*', price_text.replace('$', '').strip())
            if match:
                price = float(match.group())
                logger.info(f'[Coles HTML] Extracted price ${price:.2f} for "{search_term}"')
                return {
                    'price':         price,
                    'regular_price': price,
                    'on_sale':       False,
                    'discount_pct':  None,
                    'name':          search_term,
                }
        except Exception as e:
            logger.warning(f'[Coles HTML fallback] Failed to parse extracted price: {e}')

    return None
