import express from 'express';
import db from './db.mjs';
const usersRouter = express.Router();

//Login POST 
usersRouter.post('/login', (req,res)=>{
	
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
usersRouter.get('/login', (req,res)=>{
	res.json({username: req.session.username || null});
});

//Logout POST route
usersRouter.post('/logout', (req,res)=>{
	req.session = null;
	res.json({'success': 1});
});


export default usersRouter;