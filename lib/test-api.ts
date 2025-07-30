// Simple API test utility for debugging
export async function testLoginAPI() {
  try {
    console.log("Testing login API...")
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123"
      })
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log("Response text:", text)
    
    let data
    try {
      data = JSON.parse(text)
      console.log("Parsed response data:", data)
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return { error: "Invalid JSON response", text }
    }
    
    return { response, data, status: response.status }
  } catch (error) {
    console.error("API test failed:", error)
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

// Add to window object for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).testLoginAPI = testLoginAPI
}
