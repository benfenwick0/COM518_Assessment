//Middleware to check login for all routes
function userCheck(req, res, next){
    //If the method is POST or DELETE move on or 'next'
    if(["POST"].indexOf(req.method) == -1){
        next();
    } else{
        //Then checks that the user is logged in to the session if they are then 'next' if not the else is called and they get an alert
        if(req.session.username){
            next();
        }else{
            res.status(401).json({Error: "You're not logged in. Go away!"});
        }
    }
};

export default userCheck;