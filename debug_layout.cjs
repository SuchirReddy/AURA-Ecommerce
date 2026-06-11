const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:5173/category/menswear ...');
  await page.goto('http://localhost:5173/category/menswear', { waitUntil: 'networkidle0' });

  const bounds = await page.evaluate(() => {
    const getRect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return { 
        top: r.top, bottom: r.bottom, height: r.height, 
        position: style.position, display: style.display, float: style.float
      };
    };
    
    return {
      page: getRect('.category-page'),
      hero: getRect('.category-hero'),
      content: getRect('.category-content'),
      grid: getRect('.shop-product-grid'),
      footer: getRect('.footer')
    };
  });
  
  console.log(JSON.stringify(bounds, null, 2));
  await browser.close();
})();
