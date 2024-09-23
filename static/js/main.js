// Load data from the JSON file on the server
async function loadData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    document.getElementById('dataDisplay').textContent = JSON.stringify(data, null, 2);

    // data.people.forEach(person => {
    //     console.log(person.name, person.age, person.surname)
    // });

    // console.log(data.people.filter(person => person.age === 55))
}

// Save data to the JSON file on the server
async function saveData() {
    const newItem = document.getElementById('newItem').value;
    const response = await fetch('/api/data');
    const data = await response.json();
    data.people.push(JSON.parse(newItem));

    await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadData(); // Reload data after saving
}

// remove data     age as example
async function removeDataByAge() {

    const age = document.getElementById("ageRemove").value
    const response = await fetch('/api/data');
    var data = await response.json();

    
    // removes all people with specified age

    console.log(age)

    data.people = data.people.filter(person => person.age != age)
    
    console.log(data.people)

    await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadData(); // Reload data after saving
}

window.onload = function () {
    loadData(); // Load data when the page loads
}