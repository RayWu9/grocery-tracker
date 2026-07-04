"""
Supabase database write helpers for PricePulse scraper.
"""

from datetime import date, timedelta
from supabase import create_client, Client
import config


def get_client() -> Client:
    """Return an authenticated Supabase client using the service-role key."""
    return create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)


def get_week_start(reference: date = None) -> date:
    """Return the Monday of the current (or given) week."""
    d = reference or date.today()
    return d - timedelta(days=d.weekday())  # 0 = Monday


def upsert_price_snapshot(
    client: Client,
    product_id: str,
    store_id: str,
    price: float,
    regular_price: float | None = None,
    on_sale: bool = False,
    discount_pct: int | None = None,
    pack_qty: int | None = None,
    pack_label: str | None = None,
) -> None:
    """
    Insert or update a price snapshot for this week.
    Uses UPSERT to avoid duplicates (unique on product_id + store_id + week_start).
    """
    week_start = get_week_start().isoformat()

    data = {
        'product_id':    product_id,
        'store_id':      store_id,
        'price':         round(price, 2),
        'regular_price': round(regular_price, 2) if regular_price else None,
        'on_sale':       on_sale,
        'discount_pct':  discount_pct,
        'pack_qty':      pack_qty,
        'pack_label':    pack_label,
        'week_start':    week_start,
    }

    result = (
        client.table('price_snapshots')
        .upsert(data, on_conflict='product_id,store_id,week_start')
        .execute()
    )

    if hasattr(result, 'error') and result.error:
        raise RuntimeError(f"Supabase upsert failed for {product_id}/{store_id}: {result.error}")


def fetch_recent_snapshots(client: Client, product_id: str, weeks: int = 26):
    """
    Fetch the last N weeks of snapshots for a product across all stores.
    Useful for building/verifying history locally.
    """
    cutoff = (date.today() - timedelta(weeks=weeks)).isoformat()
    result = (
        client.table('price_snapshots')
        .select('*')
        .eq('product_id', product_id)
        .gte('week_start', cutoff)
        .order('week_start', desc=True)
        .execute()
    )
    return result.data
