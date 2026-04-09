-- qr_codes(PRODUCT 타입)의 destination_url을 products.product_url로 동기화
UPDATE public.qr_codes qr
SET destination_url = p.product_url
FROM public.products p
WHERE qr.type = 'PRODUCT'
  AND qr.target = p.id
  AND p.product_url IS NOT NULL;
