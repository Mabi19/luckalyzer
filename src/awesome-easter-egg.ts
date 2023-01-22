export function registerAwesomeKeyHandler(trigger: string) {
    const queue: string[] = [];
    document.documentElement.addEventListener("keydown", (ev: KeyboardEvent) => {
        if (queue.length < trigger.length) {
            queue.push(ev.key);
        } else {
            queue.shift();
            queue.push(ev.key);
        }
        if (queue.length == trigger.length) {
            let result = true;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i] != trigger[i]) {
                    result = false;
                    break;
                }
            }
            if (result) document.documentElement.classList.toggle("awesome");
        }
    });
}