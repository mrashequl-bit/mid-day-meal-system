import { verifyPassword } from './app/lib/password.ts';

async function test() {
  const hash = "pbkdf2-sha256:100000:WtmmrML3BVs9WIEl-l0hPg:2nxZ9cIpp59DZwmyXNG3bxmapfuNp2wOfYngFMXhrYA";
  const res = await verifyPassword("123456", hash);
  console.log("Matches:", res.ok);
}

test();
