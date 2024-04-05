import 'leaflet';

const map = L.map("map1");

const attrib="Map data copyright OpenStreetMap contributors, Open Database Licence";

const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { attribution: attrib }
).addTo(map);



const loginStatus = async()=>{
    try{
        const response = await fetch('/login');
        const data = await response.json();

        if (data.username == null){
            document.getElementById("login_form").style.display = 'block';
            document.getElementById("loggedinStatus").style.display = 'none';
        }
        else{
            document.getElementById("login_form").style.display = 'none';
            document.getElementById("loggedinmessage").innerHTML = `Logged in as '${data.username}'`;
            document.getElementById("loggedinStatus").style.display = 'block';
            }
    } catch (e){
        alert(`Error: ${e}`);
    }
}


loginStatus();


document.getElementById("login_button").addEventListener("click", async ()=>{
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try{
        const response = await fetch('/login',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });

        if (response.status ==200){
            const user = await response.json();
            document.getElementById("login_form").style.display = 'none';
            document.getElementById("loggedinmessage").innerHTML = `Logged in as '${user.username}'`;
            document.getElementById("loggedinStatus").style.display = 'block';
        }
        else{
            alert('Login failed. Please enter credentials again.')
        }
    }catch(error){
        alert(`Error: ${e}`);
    }

});

document.getElementById("logout_Button").addEventListener("click", async ()=>{
    try{
        const response = await fetch('/logout',{
            method: 'POST',
        });

        if (response.status ==200){
            alert('Logged out successfully');
            document.getElementById("login_form").style.display = 'block';
            document.getElementById("loggedinmessage").innerHTML = "";
            document.getElementById("loggedinStatus").style.display = 'none';

        }
        else{
            alert('Login failed. Please enter credentials again.')
        }
    }catch(error){
        alert(`Error: ${e}`);
    }

});


document.getElementById("locationButton").addEventListener("click", e=>{

    const location = document.getElementById("locationSearch").value;
    ajaxSearch(location);
});
;

async function ajaxSearch(location){

    const ajaxResponse = await fetch(`/location/${location}`);
    const accoms = await ajaxResponse.json();



    //To clear exisiting results to prevent them stacking
    document.getElementById("location_results").innerHTML = '';

    accoms.forEach(accom => {

            const entryContainer = document.createElement("div");

            let paragraph = document.createElement("p");
            
            const textNode = document.createTextNode(`Name: ${accom.name} || Type: ${accom.type} || Location: ${accom.location} || Description: ${accom.description} `);
            
            document.getElementById("location_results").appendChild(paragraph);

            paragraph.appendChild(textNode);

    

            const buttonElement = document.createElement("input");

            buttonElement.setAttribute("id", "buyButton");
            buttonElement.setAttribute("type", "button");
            buttonElement.setAttribute("value", "Book now");
            buttonElement.addEventListener ("click", async()=>{
			
                try{
                    const response = await fetch(`/book-accommodation`,{
                        method: 'POST',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            accommodation_id: accom.ID,
                            num_people: 1,
                            date: 240601
                        })
                    });	
                    
                    if(response.status == 200) {
                        alert("Successfully booked");
                    } else if (response.status == 400){
                        const data = await response.json();
                        alert(data.error);
                    } else if (response.status == 404) {
                        alert("No place in that location");
                    } else if (response.status == 401) {
                        alert("User not logged in");
                    } else {
                        alert(`Unknown error: code ${response.status}`);
                    }
                } 
                catch(e) {
                    alert(`Error: ${e}`);
                }
            
            });
            paragraph.appendChild(entryContainer);
            paragraph.appendChild(buttonElement);
        
    });
    document.getElementById("searchFormdiv").style.width = '750px';
};


















/*
document.getElementById("bookingForm").addEventListener("submit", async() =>{
    const accbooking = {
        "accomodation_id": document.getElementById("accomodation_id").value,
        "num_people": document.getElementById("num_people").value,
        "date": document.getElementById("date").value
    };

    try{

        const response = await fetch('/book-accommodation', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accbooking)
        });
                // Handle the status returned from the server
        if(response.status == 200) {
            alert("Successfully added");
        } else if (response.status == 400) {
            alert("Blank fields");
        } else {
            alert(`Unknown error: code ${response.status}`);
        }
    } catch(e) {
        alert(`Error: ${e}`);
    }
});
*/