CREATE OR REPLACE FUNCTION public.order_status_change() 
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM pg_notify('order_status_change', row_to_json(OLD)::text);
    PERFORM pg_notify('order_status_change', row_to_json(NEW)::text);
    RETURN NULL;
END;
$function$
