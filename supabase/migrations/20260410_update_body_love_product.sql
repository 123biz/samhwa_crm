-- Add product_url column for external product page links
alter table public.products
  add column if not exists product_url text;

-- Update 바디러브 → 소모코 바디러브 with external URL
update public.products
  set name = '소모코 바디러브',
      product_url = 'https://www.samhwamc.com/product/detail.html?product_no=22&cate_no=43&display_group=1'
  where id = 'body_love';

-- Update existing QR codes for this product to point to the external URL
update public.qr_codes
  set destination_url = 'https://www.samhwamc.com/product/detail.html?product_no=22&cate_no=43&display_group=1'
  where type = 'PRODUCT'
    and (target = 'body_love' or target = '바디러브');
