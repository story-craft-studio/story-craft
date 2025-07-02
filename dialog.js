// Remove the IIFE wrapper and use module-scoped variables
const dialogQueue = [];
let isDialogActive = false;

// Function to display the next dialog in the queue
function showNextDialog() {
    if (dialogQueue.length === 0) {
        isDialogActive = false;
        return;
    }

    const content = dialogQueue.shift(); // Get the next dialog content

    // Create the dialog box
    const dialogHtml = `
        <div id="dialog-box" style="">
            <p>${content}</p>
        </div>
    `;
    document.getElementById('custom-ui').insertAdjacentHTML("afterbegin", dialogHtml);

    // Add a click listener to remove the dialog and proceed
    const dialogElement = document.getElementById("dialog-box");
    dialogElement.addEventListener("click", () => {
        dialogElement.remove();
        showNextDialog(); // Show the next dialog in the queue
    });

    isDialogActive = true;
}

// Export the dialog function instead of attaching to window
export function dialog(content) {
    dialogQueue.push(content);

    if (!isDialogActive) {
        showNextDialog();
    }
}