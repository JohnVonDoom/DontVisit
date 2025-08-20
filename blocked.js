// Get blocked URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const blockedUrl = urlParams.get('blocked');

if (blockedUrl) {
    // Update title with blocked URL if available
    document.title = `Blocked: ${new URL(decodeURIComponent(blockedUrl)).hostname} - DontVisit`;
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'about:blank';
    }
}

function openExtension() {
    // This will open the extension popup (if possible)
    // Note: Direct popup opening from content pages is limited
    alert('Click the DontVisit extension icon in your browser toolbar to manage blocked sites.');
}

function closeTab() {
    window.close();
}

// Productivity Quotes Dictionary - Easy to modify!
// To add a new quote: Add a new object with quote and author properties
// To remove a quote: Delete the object from this array
const productivityQuotes = [
    {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
    },
    {
        quote: "Focus is a matter of deciding what things you're not going to do.",
        author: "John Carmack"
    },
    {
        quote: "The successful warrior is the average person with laser-like focus.",
        author: "Bruce Lee"
    },
    {
        quote: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
        author: "Alexander Graham Bell"
    },
    {
        quote: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle"
    },
    {
        quote: "The art of being wise is knowing what to overlook.",
        author: "William James"
    },
    {
        quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
        author: "Marcus Aurelius"
    },
    {
        quote: "The time you enjoy wasting is not wasted time.",
        author: "Bertrand Russell"
    },
    {
        quote: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
        author: "Paul J. Meyer"
    },
    {
        quote: "Don't confuse being busy with being productive.",
        author: "Tim Ferriss"
    },
    {
        quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        author: "Stephen Covey"
    },
    {
        quote: "Until we can manage time, we can manage nothing else.",
        author: "Peter Drucker"
    },
    {
        quote: "The most efficient way to live reasonably is every morning to make a plan of one's day and every night to examine the results obtained.",
        author: "Alexis Carrel"
    },
    {
        quote: "Either you run the day or the day runs you.",
        author: "Jim Rohn"
    },
    {
        quote: "Time is what we want most, but what we use worst.",
        author: "William Penn"
    },
    {
        quote: "The bad news is time flies. The good news is you're the pilot.",
        author: "Michael Altshuler"
    },
    {
        quote: "What gets measured gets managed.",
        author: "Peter Drucker"
    },
    {
        quote: "If you want to make good use of your time, you've got to know what's most important and then give it all you've got.",
        author: "Lee Iacocca"
    },
    {
        quote: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
        author: "Thomas Sowell"
    },
    {
        quote: "Being busy does not always mean real work. The object of all work is production or accomplishment.",
        author: "Thomas Edison"
    }
];

// Load a random productivity quote
function loadProductivityTip() {
    const randomQuote = productivityQuotes[Math.floor(Math.random() * productivityQuotes.length)];
    const tipElement = document.getElementById('productivity-tip-text');
    tipElement.innerHTML = `"${randomQuote.quote}"<br>- ${randomQuote.author}`;
}

// Load the productivity tip when page loads
loadProductivityTip();

// Update statistics when page loads
chrome.runtime.sendMessage({
    action: 'logActivity',
    data: {
        type: 'blockedPageViewed',
        url: blockedUrl,
        timestamp: Date.now()
    }
}).catch(() => {
    // Ignore errors if extension context is not available
});
