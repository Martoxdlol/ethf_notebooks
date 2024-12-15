export async function GET(req: Request) {
    const html = await fetch(new URL('/app/index.html', req.url).toString()).then((r) => r.text())
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
