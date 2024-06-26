import express from 'express';
import expressSession from 'express-session';
import betterSqlite3Session from 'express-session-better-sqlite3';

import usersRouter from './routes/users.mjs';
import db from './routes/db.mjs';
import userCheck from './middleware/userCheck.mjs';

const app = express();

app.use(express.json());
    
app.use(express.static('public'));

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

app.use('/users', usersRouter);

app.use(userCheck);


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
            if(!req.body.accommodation_id || !req.body.num_people || !req.body.date){
                res.status(400).json({error: 'Missing details. Please make sure all information is inputted correctly!'});
            } else {

                        const currentDate = new Date(); // Get the current date
        
        
                        // Format the current date in YYMMDD
                        const current_year = currentDate.getFullYear().toString().slice(-2);
                        const current_month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                        const current_day = currentDate.getDate().toString().padStart(2, '0');
                        const formattedCurrentDate = current_year + current_month + current_day;
        
                        // Store the formatted current date in the session
                        req.session.currentDate = formattedCurrentDate;



                        if (req.body.date < req.session.currentDate) {
                            res.status(400).json({ error: "Booking date cannot be in the past." });
                        } else {
                            //Check availability of booking date
                            const checkAvailabilityStmt = db.prepare('SELECT availability FROM acc_dates WHERE accID = ? AND thedate = ?');
                            const availabilityInfo = checkAvailabilityStmt.get(req.body.accommodation_id, req.body.date);
                            if (!availabilityInfo || availabilityInfo.availability < req.body.num_people) {
                                return res.status(400).json({ error: "No availability for the specified date or number of people." });
                            }
                            else{                            
                            // Insert record into acc_bookings table
                            const insertBookingStmt = db.prepare('INSERT INTO acc_bookings (accID, npeople, username, thedate) VALUES (?, ?, ?, ?)');
                            const info = insertBookingStmt.run(req.body.accommodation_id, req.body.num_people, req.session.username, req.body.date);

                            // Reduce availability in the acc_dates table
                            const updateAvailabilityStmt = db.prepare('UPDATE acc_dates SET availability = availability - 1 WHERE accID = ? AND thedate = ?');
                            updateAvailabilityStmt.run(req.body.accommodation_id, req.body.date);

                            res.status(200).json({ message: 'Accommodation booked successfully!', id: info.lastInsertRowid }); 
                            } 
                    }         
            
        }
    } catch (error) {
        res.status(500).json({ error: error});
    }
});




app.post('/book-accommodation-map', (req, res) => {
    try {
            if(!req.body.accommodation_id || !req.body.num_people || !req.body.date){
                res.status(400).json({error: 'Missing details. Please make sure all information is inputted correctly!'});
            } else {
                const currentDate = new Date(); // Get the current date

                // Format the current date in YYYY-MM-DD
                const year = currentDate.getFullYear(); // Get the year
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Get the month (add 1 as it's zero-based) and pad with leading zero if necessary
                const day = currentDate.getDate().toString().padStart(2, '0'); // Get the day and pad with leading zero if necessary
                
                const formattedDate = `${year}-${month}-${day}`;

                // Store the formatted current date in the session
                

                if (req.body.date < formattedDate) {
                    res.status(400).json({ error: "Booking date cannot be in the past." });
                } else {
                        // Insert record into acc_bookings table
                        const insertBookingStmt = db.prepare('INSERT INTO acc_bookings (accID, npeople, username, thedate) VALUES (?, ?, ?, ?)');
                        const info = insertBookingStmt.run(req.body.accommodation_id, req.body.num_people, req.session.username, req.body.date);

                        // Reduce availability in the acc_dates table
                        const updateAvailabilityStmt = db.prepare('UPDATE acc_dates SET availability = availability - 1 WHERE accID = ? AND thedate = ?');
                        updateAvailabilityStmt.run(req.body.accommodation_id, req.body.date);

                        res.status(200).json({ message: 'Accommodation booked successfully!', id: info.lastInsertRowid }); 
                        }
            
            
        }
    } catch (error) {
        res.status(500).json({ error: error});
    }
});





app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
});
