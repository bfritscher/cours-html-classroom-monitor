import { spawnTestProcess } from "./validation";

spawnTestProcess({
    url: "https://thimbleprojects.org/bfritscher/583055/",
    email: "test",
    assignment: "exercice04"
}, (err: any, res:any ) => {
    console.log(err, res)
})
