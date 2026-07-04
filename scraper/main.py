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
from scrapers import woolworths, coles, amazon_au

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


def scrape_and_save(client, item: dict) -> None:
    """
    Scrape all stores for a single tracked item and write results to Supabase.
    """
    product_id = item['id']
    logger.info(f'━━━ {product_id} ━━━')

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

    # ── Amazon AU ──
    asin = item.get('amazon_asin')
    # Read pack_qty from config's store data (we store it in config for Amazon items)
    # For simplicity, pack_qty is defined inline here based on product id
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

    success_count = 0
    error_count   = 0

    for item in config.TRACKED_ITEMS:
        try:
            scrape_and_save(client, item)
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


if __name__ == '__main__':
    main()
