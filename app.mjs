import express from 'express';
import Database from 'better-sqlite3';
import expressSession from 'express-session';
import betterSqlite3Session from 'express-session-better-sqlite3';

const app = express();

app.use(express.json());
    
app.use(express.static('public'));

const db = new Database("placestostay.db")
const SqliteStore = betterSqlite3Session(expressSession, db);

app.use(expressSession({
    store: new SqliteStore(), 
    secret: 'BinnieAndClyde', 
    resave: true, 
    saveUninitialized: false, 
    rolling: true, 
    unset: 'destroy', 
    proxy: true, 
    cookie: { 
        maxAge: 600000,
        httpOnly: false 
    }
}));


//Search by Location
app.get('/location/:location', (req,res) => {
    try{
        const stmt = db.prepare('SELECT * FROM accommodation WHERE location = ?')
        const results = stmt.all(req.params.location);
        res.json(results);
    }
    catch(error){
        res.status(500).json({error: error});
    }
});


// Search by type and location
app.get('/type/:type/location/:location', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM accommodation WHERE type=? AND location=?');
        const results = stmt.all(req.params.type, req.params.location);
        res.json(results);
    } catch(error) {
        res.status(500).json({error: error});
    }
});

app.use((req,res,next)=>{
	console.log("Session is");
	console.log(req.session);
	next();
});



app.post('/book-accommodation', (req, res) => {
    try {
        if(!req.session || !req.session.username){
            res.status(401).json({error: "Unauthorized: No user logged in"});
        } else{
            if(!req.body.accommodation_id || !req.body.num_people || !req.body.date){
                res.status(400).json({error: 'Missing details. Please make sure all information is inputted correctly!'});
            } else {
                // Insert record into acc_bookings table
                const insertBookingStmt = db.prepare('INSERT INTO acc_bookings (accID, npeople, username, thedate) VALUES (?, ?, ?, ?)');
                const info = insertBookingStmt.run(req.body.accommodation_id, req.body.num_people, req.session.username, req.body.date);

                // Reduce availability in the acc_dates table
                const updateAvailabilityStmt = db.prepare('UPDATE acc_dates SET availability = availability - 1 WHERE accID = ? AND thedate = ?');
                updateAvailabilityStmt.run(req.body.accommodation_id, req.body.date);

                res.json({ message: 'Accommodation booked successfully!', id: info.lastInsertRowid }); 
            }
        }
    } catch (error) {
        res.status(500).json({ error: error});
    }
});




//Login POST 
app.post('/login', (req,res)=>{
	
	const stmt = db.prepare('SELECT * FROM acc_users WHERE username=? and password=?')
	const results = stmt.all(req.body.username, req.body.password);
	
	if(results.length == 1){
		req.session.username = results[0].username;
		res.json({"username": req.body.username});
	} else{
		res.status(401).json({error: "Incorrect login!"});
	}
	
});

//Login GET
app.get('/login', (req,res)=>{
	res.json({username: req.session.username || null});
});


//Logout POST route
app.post('/logout', (req,res)=>{
	req.session = null;
	res.json({'success': 1});
});

app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
});
