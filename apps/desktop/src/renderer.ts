import { updateCount } from "./counter";

const output = document.querySelector<HTMLOutputElement>("#count")!;
let count = 0;

for (const action of ["increment", "reset"] as const) {
  document.getElementById(action)!.addEventListener("click", () => {
    count = updateCount(count, action);
    output.value = String(count);
  });
}
