const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function inspect() {
  const dir = path.resolve('..', 'supplier_docs_temp');
  const files = fs.readdirSync(dir);

  for (const f of files) {
    if (f.endsWith('.pdf')) {
      console.log('\n====================================');
      console.log('PARSING PDF:', f);
      console.log('====================================');
      try {
        const dataBuffer = fs.readFileSync(path.join(dir, f));
        const parser = new PDFParse({ data: dataBuffer });
        await parser.load();
        const text = await parser.getText();
        console.log('Text length:', text.length);
        console.log('First 2000 chars:');
        console.log(text.substring(0, 2000));
        if (text.length > 2000) {
          console.log('\n--- Mid / Later sample (from index 2000 to 4000) ---');
          console.log(text.substring(2000, 4000));
        }
      } catch (err) {
        console.error('Error reading PDF:', f, err);
      }
    }
  }
}

inspect();
