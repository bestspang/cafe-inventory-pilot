-- Function to count missing stock checks for today
CREATE OR REPLACE FUNCTION public.count_missing_checks()
RETURNS TABLE (missing bigint) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT count(*) AS missing
  FROM branches b
  WHERE NOT EXISTS (
    SELECT 1 FROM stock_checks sc
    WHERE sc.branch_id = b.id
      AND date_trunc('day', sc.checked_at) = date_trunc('day', now())
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get branch trend data (daily counts for the last 14 days)
CREATE OR REPLACE FUNCTION public.get_branch_trend_data()
RETURNS TABLE (day date, count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      date_trunc('day', now()) - interval '13 days',
      date_trunc('day', now()),
      interval '1 day'
    )::date as day
  )
  SELECT
    d.day::date,
    count(b.id)::bigint
  FROM
    date_range d
  LEFT JOIN
    branches b ON date_trunc('day', b.created_at)::date <= d.day
  GROUP BY
    d.day
  ORDER BY
    d.day;
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock trend data
CREATE OR REPLACE FUNCTION public.get_low_stock_trend_data()
RETURNS TABLE (day date, count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      date_trunc('day', now()) - interval '13 days',
      date_trunc('day', now()),
      interval '1 day'
    )::date as day
  )
  SELECT
    d.day::date,
    count(bi.*)::bigint
  FROM
    date_range d
  LEFT JOIN
    branch_inventory bi ON 
      date_trunc('day', bi.last_checked)::date = d.day AND
      bi.on_hand_qty < bi.reorder_pt
  GROUP BY
    d.day
  ORDER BY
    d.day;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending requests trend data
CREATE OR REPLACE FUNCTION public.get_pending_requests_trend_data()
RETURNS TABLE (day date, count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      date_trunc('day', now()) - interval '13 days',
      date_trunc('day', now()),
      interval '1 day'
    )::date as day
  )
  SELECT
    d.day::date,
    count(r.*)::bigint
  FROM
    date_range d
  LEFT JOIN
    requests r ON 
      date_trunc('day', r.requested_at)::date = d.day AND
      r.status = 'pending'
  GROUP BY
    d.day
  ORDER BY
    d.day;
END;
$$ LANGUAGE plpgsql;

-- Function to get missing checks trend data
CREATE OR REPLACE FUNCTION public.get_missing_checks_trend_data()
RETURNS TABLE (day date, count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      date_trunc('day', now()) - interval '13 days',
      date_trunc('day', now()),
      interval '1 day'
    )::date as day
  ),
  daily_branches AS (
    SELECT
      d.day,
      (SELECT count(*) FROM branches b WHERE b.created_at::date <= d.day)::bigint as total_branches
    FROM date_range d
  ),
  daily_checks AS (
    SELECT
      date_trunc('day', checked_at)::date as check_day,
      count(DISTINCT branch_id)::bigint as branches_checked
    FROM
      stock_checks
    WHERE
      checked_at >= (now() - interval '14 days')
    GROUP BY
      check_day
  )
  SELECT
    db.day::date,
    (db.total_branches - COALESCE(dc.branches_checked, 0))::bigint as count
  FROM
    daily_branches db
  LEFT JOIN
    daily_checks dc ON db.day = dc.check_day
  ORDER BY
    db.day;
END;
$$ LANGUAGE plpgsql;
