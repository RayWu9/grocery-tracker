"""
PricePulse — Weekly Scraper Orchestrator
Runs automatically every Monday via GitHub Actions.
Can also be run manually: python main.py

Usage:
  python main.py              # Run all scrapers, write to Supabase
  MOCK_MODE=true python main.py  # Dry run — no HTTP calls, no DB writes
"""

import time
import logging
import sys
from datetime import datetime

import config
import db
import alerts
from scrapers import woolworths, coles, amazon_au, chemist_warehouse

# ── Logging setup ────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)-7s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger(__name__)


def scrape_and_save(client, item: dict) -> dict:
    """
    Scrape all stores for a single tracked item and write results to Supabase.
    Returns a dict mapping store ID to True (success), False (failure), or None (not tracked).
    """
    product_id = item['id']
    logger.info(f'━━━ {product_id} ━━━')

    results = {'woolworths': None, 'coles': None, 'amazon': None, 'chemist_warehouse': None}

    # ── Woolworths ──
    if item.get('woolworths_term'):
        if not config.MOCK_MODE:
            result = woolworths.search_product(item['woolworths_term'], timeout=config.REQUEST_TIMEOUT)
            time.sleep(config.REQUEST_DELAY)
        else:
            result = {'price': 3.30, 'regular_price': 3.30, 'on_sale': False, 'discount_pct': None, 'name': 'MOCK'}

        if result:
            db.upsert_price_snapshot(
                client,
                product_id=product_id,
                store_id='woolworths',
                price=result['price'],
                regular_price=result.get('regular_price'),
                on_sale=result.get('on_sale', False),
                discount_pct=result.get('discount_pct'),
            )
            results['woolworths'] = True
        else:
            results['woolworths'] = False

    # ── Coles ──
    if item.get('coles_term'):
        if not config.MOCK_MODE:
            result = coles.search_product(item['coles_term'], timeout=config.REQUEST_TIMEOUT)
            time.sleep(config.REQUEST_DELAY)
        else:
            result = {'price': 3.30, 'regular_price': 3.30, 'on_sale': False, 'discount_pct': None, 'name': 'MOCK'}

        if result:
            db.upsert_price_snapshot(
                client,
                product_id=product_id,
                store_id='coles',
                price=result['price'],
                regular_price=result.get('regular_price'),
                on_sale=result.get('on_sale', False),
                discount_pct=result.get('discount_pct'),
            )
            results['coles'] = True
        else:
            results['coles'] = False

    # ── Amazon AU ──
    asin = item.get('amazon_asin')
    pack_qty = PACK_QTYS.get(product_id, 1)

    if asin:
        if not config.MOCK_MODE:
            result = amazon_au.get_product_price(asin, pack_qty=pack_qty, timeout=config.REQUEST_TIMEOUT)
            time.sleep(config.REQUEST_DELAY)
        else:
            result = {'price': 58.00, 'regular_price': 58.00, 'on_sale': False, 'discount_pct': None, 'unit_price': 2.42, 'name': 'MOCK'}

        if result:
            pack_labels = PACK_LABELS.get(product_id)
            db.upsert_price_snapshot(
                client,
                product_id=product_id,
                store_id='amazon',
                price=result['price'],
                regular_price=result.get('regular_price'),
                on_sale=result.get('on_sale', False),
                discount_pct=result.get('discount_pct'),
                pack_qty=pack_qty if pack_qty > 1 else None,
                pack_label=pack_labels,
            )
            results['amazon'] = True
        else:
            results['amazon'] = False

    # ── Chemist Warehouse ──
    if item.get('cw_term'):
        if not config.MOCK_MODE:
            result = chemist_warehouse.search_product(item['cw_term'], timeout=config.REQUEST_TIMEOUT)
            time.sleep(config.REQUEST_DELAY)
        else:
            result = {'price': 14.99, 'regular_price': 19.99, 'on_sale': True, 'discount_pct': 25, 'name': 'MOCK'}

        if result:
            db.upsert_price_snapshot(
                client,
                product_id=product_id,
                store_id='chemist_warehouse',
                price=result['price'],
                regular_price=result.get('regular_price'),
                on_sale=result.get('on_sale', False),
                discount_pct=result.get('discount_pct'),
            )
            results['chemist_warehouse'] = True
        else:
            results['chemist_warehouse'] = False

    return results


# Amazon pack information (qty and label per product)
PACK_QTYS = {
    'coca-cola-125l':          24,
    'pepsi-max-125l':          24,
    'sprite-125l':             24,
    'mt-franklin-600ml':       24,
    'skittles-original-160g':  12,
    'mentos-fruit-roll':       24,
    'cadbury-dairy-milk-180g': 12,
    'kitkat-chunky-4pk':       12,
    'lindt-excellence-85g':    12,
    'pringles-original-134g':  12,
    'kettle-sea-salt-150g':     8,
}

PACK_LABELS = {
    'coca-cola-125l':          '24 × 375ml',
    'pepsi-max-125l':          '24 × 375ml',
    'sprite-125l':             '24 × 375ml',
    'mt-franklin-600ml':       '24 × 600ml',
    'skittles-original-160g':  '12 × 160g',
    'mentos-fruit-roll':       '24 × 38g',
    'cadbury-dairy-milk-180g': '12 × 180g',
    'kitkat-chunky-4pk':       '12 × 4pk',
    'lindt-excellence-85g':    '12 × 85g',
    'pringles-original-134g':  '12 × 134g',
    'kettle-sea-salt-150g':    '8 × 150g',
}


def main():
    start = datetime.now()
    logger.info(f'🚀 PricePulse scraper started — {start.strftime("%Y-%m-%d %H:%M:%S")}')
    logger.info(f'   Mode: {"MOCK (dry run)" if config.MOCK_MODE else "LIVE"}')
    logger.info(f'   Items to scrape: {len(config.TRACKED_ITEMS)}')

    if config.MOCK_MODE:
        logger.info('⚠️  MOCK_MODE=true — skipping real HTTP requests and Supabase writes')
        client = None
    else:
        client = db.get_client()

    failed_stores = {'woolworths': [], 'coles': [], 'amazon': [], 'chemist_warehouse': []}
    success_count = 0
    error_count   = 0

    for item in config.TRACKED_ITEMS:
        try:
            results = scrape_and_save(client, item)
            for store, status in results.items():
                if status is False:
                    failed_stores[store].append(item['id'])
            success_count += 1
        except Exception as e:
            logger.error(f'Error processing {item["id"]}: {e}', exc_info=True)
            error_count += 1
        finally:
            # Small delay between items to avoid overloading servers
            if not config.MOCK_MODE:
                time.sleep(config.REQUEST_DELAY)

    elapsed = (datetime.now() - start).total_seconds()
    logger.info(f'')
    logger.info(f'✅ Done in {elapsed:.1f}s — {success_count} succeeded, {error_count} failed')

    # Send alerts if there were failures and not in mock mode
    if not config.MOCK_MODE:
        total_failures = sum(len(items) for items in failed_stores.values())
        if total_failures > 0:
            alert_lines = [
                f"⚠️ *PricePulse Scraper Warning* — Detected {total_failures} store scraping failures."
            ]
            for store, items in failed_stores.items():
                if items:
                    alert_lines.append(f"• *{store.capitalize()}* failed for {len(items)} items: {', '.join(items[:5])}" + ("..." if len(items) > 5 else ""))
            
            alert_msg = "\n".join(alert_lines)
            alerts.send_alert(alert_msg)


if __name__ == '__main__':
    main()
