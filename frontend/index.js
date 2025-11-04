//POST function

async function writeLog(){
    const url = document.getElementById('apiUrl').value.trim();
    const key = document.getElementById('apiKey').value.trim();
    const message = document.getElementById('message').value.trim();
    const severity = document.getElementById('severity').value.trim();
 
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!url) {
        showResponse('Please enter API URL', false);
        return;
    }

    if (!message) {
        showResponse('A Message is required', false);
        return;
    }


    const data = {
        id: id,
        message: message,
        severity: severity
    };

    try{
        const response = await fetch(`${url}logs`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            showResponse('Log posted successfully!', true);

            document.getElementById('message').value = '';
        } else {
            showResponse(`Error: ${result.error}`, false);
        }

    } catch (error){
        showResponse(`Network error: ${error.message}`, false)
    }
}

function showResponse(message, isSuccess){
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = message;
    responseDiv.className = `response ${isSuccess ? 'success' : 'error'}`;
    responseDiv.style.display = 'block';

    setTimeout(()=>{
        responseDiv.style.display = 'none';
    }, 5000)
}