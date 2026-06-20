-- SQL script to create the get_dashboard_analytics RPC function
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_dashboard_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    now_ts timestamptz := now();
    this_month_start timestamptz := date_trunc('month', now_ts);
    last_month_start timestamptz := date_trunc('month', now_ts - interval '1 month');
    last_month_end timestamptz := this_month_start - interval '1 microsecond';
    
    total_rev numeric;
    total_ords int;
    total_prods int;
    aov_val numeric;

    this_rev numeric;
    this_ords int;
    this_prods int;
    
    last_rev numeric;
    last_ords int;
    last_prods int;

    trends_rev numeric;
    trends_ords numeric;
    trends_prods numeric;
    trends_aov numeric;

    top_products_json json;
    daily_revenue_json json;
    sales_category_json json;
BEGIN
    -- Overall totals
    SELECT 
        COALESCE(SUM(total_amount), 0), 
        COUNT(id)
    INTO total_rev, total_ords
    FROM orders;

    IF total_ords > 0 THEN
        aov_val := ROUND(total_rev / total_ords);
    ELSE
        aov_val := 0;
    END IF;

    SELECT COALESCE(SUM(quantity), 0) INTO total_prods FROM order_items;

    -- This Month
    SELECT 
        COALESCE(SUM(total_amount), 0), 
        COUNT(id)
    INTO this_rev, this_ords
    FROM orders WHERE created_at >= this_month_start;

    SELECT COALESCE(SUM(oi.quantity), 0) INTO this_prods
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= this_month_start;

    -- Last Month
    SELECT 
        COALESCE(SUM(total_amount), 0), 
        COUNT(id)
    INTO last_rev, last_ords
    FROM orders WHERE created_at >= last_month_start AND created_at <= last_month_end;

    SELECT COALESCE(SUM(oi.quantity), 0) INTO last_prods
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= last_month_start AND o.created_at <= last_month_end;

    -- Trends Calculation
    IF last_rev = 0 THEN trends_rev := CASE WHEN this_rev > 0 THEN 100 ELSE NULL END;
    ELSE trends_rev := ROUND(((this_rev - last_rev) / last_rev) * 100, 1); END IF;

    IF last_ords = 0 THEN trends_ords := CASE WHEN this_ords > 0 THEN 100 ELSE NULL END;
    ELSE trends_ords := ROUND(((this_ords - last_ords)::numeric / last_ords) * 100, 1); END IF;

    IF last_prods = 0 THEN trends_prods := CASE WHEN this_prods > 0 THEN 100 ELSE NULL END;
    ELSE trends_prods := ROUND(((this_prods - last_prods)::numeric / last_prods) * 100, 1); END IF;

    DECLARE
        this_aov numeric := CASE WHEN this_ords > 0 THEN this_rev / this_ords ELSE 0 END;
        last_aov numeric := CASE WHEN last_ords > 0 THEN last_rev / last_ords ELSE 0 END;
    BEGIN
        IF last_aov = 0 THEN trends_aov := CASE WHEN this_aov > 0 THEN 100 ELSE NULL END;
        ELSE trends_aov := ROUND(((this_aov - last_aov) / last_aov) * 100, 1); END IF;
    END;

    -- Top Products
    SELECT json_agg(t) INTO top_products_json FROM (
        SELECT p.name, SUM(oi.quantity) as quantity, SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY p.name
        ORDER BY quantity DESC
        LIMIT 5
    ) t;

    -- Sales By Category
    DECLARE
        total_cat_revenue numeric;
    BEGIN
        SELECT COALESCE(SUM(oi.quantity * oi.price), 0) INTO total_cat_revenue FROM order_items oi;
        
        SELECT json_agg(t) INTO sales_category_json FROM (
            SELECT 
                COALESCE(c.name, 'Uncategorized') as name,
                SUM(oi.quantity * oi.price) as revenue,
                CASE WHEN total_cat_revenue > 0 THEN ROUND((SUM(oi.quantity * oi.price) / total_cat_revenue) * 100) ELSE 0 END as percentage
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            GROUP BY COALESCE(c.name, 'Uncategorized')
            ORDER BY revenue DESC
        ) t;
    END;

    -- Daily Revenue (last 30 days)
    SELECT json_agg(t) INTO daily_revenue_json FROM (
        SELECT 
            to_char(d.date, 'Mon DD') as date,
            COALESCE(SUM(o.total_amount), 0) as revenue
        FROM (
            SELECT generate_series(now_ts::date - 29, now_ts::date, '1 day'::interval)::date AS date
        ) d
        LEFT JOIN orders o ON o.created_at::date = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
    ) t;

    -- Build final JSON
    result := json_build_object(
        'totalRevenue', COALESCE(total_rev, 0),
        'totalOrders', COALESCE(total_ords, 0),
        'aov', COALESCE(aov_val, 0),
        'productsSold', COALESCE(total_prods, 0),
        'trends', json_build_object(
            'revenue', trends_rev,
            'orders', trends_ords,
            'products', trends_prods,
            'aov', trends_aov
        ),
        'topProducts', COALESCE(top_products_json, '[]'::json),
        'salesByCategory', COALESCE(sales_category_json, '[]'::json),
        'dailyRevenue', COALESCE(daily_revenue_json, '[]'::json)
    );

    RETURN result;
END;
$$;

-- ==========================================
-- PERFORMANCE INDEXES (for scaling to 50k+ orders)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
