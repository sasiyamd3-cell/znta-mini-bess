function getAliveMessage() {
   const date = new Date().toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    timeZone: 'Asia/Colombo' 
});

const time = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false, 
    timeZone: 'Asia/Colombo' 
});

//--------------------------------------------------------
    return `Kamathi vidiyakata hadaganna `;
}

module.exports = { getAliveMessage };
