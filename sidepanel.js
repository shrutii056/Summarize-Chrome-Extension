document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["summary"], function (result) {
    if (result.summary) {
      document.getElementById("notes").value = result.summary;
    }
  });
  document
    .getElementById("summarizeBtn")
    .addEventListener("click", summarizeText);
  document.getElementById("saveNotesBtn").addEventListener("click", saveNotes);
});

async function summarizeText() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString(),
    });
    if (!result) {
      showResult("Please select some text to summarize");
      return;
    }
    const response = await fetch("http://localhost:8080/api/research/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: result, operation: "summarize" }),
    });
    if (!response.ok) {
      throw new Error(`Api Error: ${response.status}`);
    }
    const text = await response.text();
    showResult(text.replace(/\n/g, "<br>"));
  } catch (error) {
    showResult("Error: " + error.message);
  }
}

async function saveNotes() {
  const notes = document.getElementById("notes").value;
  chrome.storage.local.set({ summary: notes }, function () {
    alert("Notes saved successfully!");
  });
}

function showResult(content) {
  document.getElementById("results").innerHTML =
    `<div class="result-item"><div class="result-content">${content}</div></div>`;
}
