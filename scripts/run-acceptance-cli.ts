
import { runAcceptanceTests } from '../src/test/acceptance-tests';

runAcceptanceTests().then(res => {
  if (res.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch(err => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
