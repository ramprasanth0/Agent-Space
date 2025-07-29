


export async function sendChatToPerplexity(query) {
    const result = await fetch('/chat/perplexity',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
    })

    const data = await result.json();
    console.log(data);
    return data
}
