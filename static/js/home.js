
var data = null

async function loadData() {
    const response = await fetch('/api/data');
    data = await response.json();

    loadTemplates()
}

function makeTemplatesItem(id, title) {

    const ul = document.querySelector("#templates > ul.list")

    const li = document.createElement("li")
    li.classList.add("template")

    ul.appendChild(li)

    const idP = document.createElement("p")
    idP.classList.add("template-id")
    idP.innerText = `#${id}`

    li.appendChild(idP)

    const titleP = document.createElement("p")
    titleP.classList.add("template-title")
    titleP.innerText = title

    li.appendChild(titleP)

    const editA = document.createElement("a")
    editA.classList.add("template-edit")
    editA.innerText = "edit"
    editA.href = `/template/${id}`

    li.appendChild(editA)

    const useA = document.createElement("a")
    useA.classList.add("template-use")
    useA.innerText = "use"
    useA.addEventListener("click", () => useTemplate(id))

    li.appendChild(useA)

}


function useTemplate(id) {
    console.log(`use template ${id}`)
}


function loadTemplates() {
    const templates = data.templates

    document.querySelector("#templates > ul.list").innerHTML = ""

    console.log(templates)

    templates.forEach(template => {
        makeTemplatesItem(template.id, template.name)
    })
}

window.onpageshow = () => {
    console.log("aaaah")
    loadData()
}


// makeTemplatesItem(1, "heyyyyyyyyyyyyyyyy")
// makeTemplatesItem(2, "doeiii")