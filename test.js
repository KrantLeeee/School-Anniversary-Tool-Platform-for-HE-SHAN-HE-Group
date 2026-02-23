async function run() {
  const req = await fetch('http://localhost:3000/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Mock cookie session if needed... Wait, the route says:
      // const session = await auth()
      // if (!session?.user) { return new Response('Unauthorized', { status: 401 }) }
    },
    body: JSON.stringify({
      message: "hi",
      toolId: "school-research-tool"
    })
  });

  const text = await req.text();
  console.log(req.status);
  console.log(text.substring(0, 1000));
}

run().catch(console.error);
