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

//GET function
async function readLogs(){
    const url = document.getElementById('apiUrl').value.trim();
    const key = document.getElementById('apiKey').value.trim();
    document.getElementById('getLogsBtn').textContent = "Refresh Logs";
    if(!url){
        showResponse('Please enter API URL', false);
        return;
    }

    try{
        const response = await fetch(`${url}logs/all?limit=100`, {
            method: 'GET',
            headers: {
                'x-api-key': key
            }
        });

        const result = await response.json();

        if (response.ok) {
            if(result.items && result.items.length > 0){
                showResponse(`Showing ${result.items.length} most recent logs`, true);
                displayLogs(result.items);
            } else {
                showResponse('No logs found', true);
                document.getElementById('logs').innerHTML = '<p>No logs to display</p>';
            }
        }else {
            showResponse(`Error: ${result.error || 'Failed to fetch logs'}`, false);
            document.getElementById('logs').innerHTML = '';
        }
    }catch (error) {
        showResponse(`Network error: ${error.message}`, false);
        document.getElementById('logs').innerHTML = '';
    }
}

function displayLogs(logs){
    const logsdiv = document.getElementById('logs');

    logsdiv.innerHTML = logs.map(log => `
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: white;">
            <div style="margin-bottom: 8px;">
                <strong style="color: #667eea;">ID:</strong> ${log.ID}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Severity:</strong> 
                <span style="padding: 3px 8px; border-radius: 3px; background: ${getSeverityColor(log.Severity)}; font-weight: bold;">
                    ${log.Severity}
                </span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Message:</strong> ${log.Message}
            </div>
            <div style="color: #6c757d; font-size: 0.9em;">
                <strong>Time:</strong> ${new Date(log.DateTime).toLocaleString()}
            </div>
        </div>
    `).join('');
}

function getSeverityColor(severity) {
    switch(severity) {
        case 'ERROR': return '#f8d7da';
        case 'WARNING': return '#fff3cd';
        case 'INFO': return '#d1ecf1';
        default: return '#e9ecef';
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