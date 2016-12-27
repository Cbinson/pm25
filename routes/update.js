var mongoose = require('mongoose');
var Airpm = mongoose.model('airpm');

exports.index  = function(req,res){
	console.log("xxxxx");
    Airpm.find( function(err, pm) {
        if (err) return res.render('Error occurred');
        res.send(pm);
    });
};

// exports.findById = function(req,res){
//     Airpm.findById( req.params.id, function( err, pm ) {
//         if (err) {
//             res.send('Error occurred');
//             return console.log(err);
//         }
//         res.send(pm);
//     });
// };

// exports.newTodo = function(req,res){
//     var emp = new Airpm(req.body);

//     emp.save(function(err){
//         if (err) {
//             res.send('Error occurred');
//             return console.log(err);
//         }
//         res.send(emp);
//     });
// }

// exports.update = function(req,res){
//     Airpm.findById( req.params.id, function( err, pm ) {
//         if(!pm){
//             res.send('Todo not found with given id');
//         }else{
//             if(pm.__v != req.body.__v){
//                 return res.send('Please use the update todo details as ' + pm);
//             }
//             pm.set(req.body)
//             if(pm.isModified()){
//                 pm.increment();
//                 pm.save(function(err){
//                     if (err) {
//                         res.send('Error occurred');
//                         return console.log(err);
//                     }
//                     res.send(pm);
//                 });
//             }else{
//                 res.send(pm);
//             }

//         }
//     });
// };