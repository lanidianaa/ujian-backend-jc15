const { query } = require('../database');
const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../helpers');

//Get All Movies
router.get('/get/all', async(req,res)=> {
    try{
        const response = await query(`
        SELECT 
            m.name,
            m.release_date,
            m.release_month,
            m.release_year,
            m.duration_min,
            m.genre,
            m.description,
            ms.status,
            l.location,
            st.time
        FROM movies m LEFT JOIN movie_status ms ON m.status = ms.id
        LEFT JOIN schedules sc ON sc.movie_id = m.id
        LEFT JOIN locations l ON l.id = sc.location_id
        LEFT JOIN show_times st ON st.id = sc.time_id`);
        return res.status(200).send(response);
    }catch(err){
        return res.status(500).send(err);
    };
});

//Get with query
router.get('/get', async(req,res) => {
    try{
        const { status, location, time } = req.query;
        let sql = `
            SELECT 
                m.name,
                m.release_date,
                m.release_month,
                m.release_year,
                m.duration_min,
                m.genre,
                m.description,
                ms.status,
                l.location,
                st.time
            FROM movie_status ms JOIN movies m ON ms.id = m.status
            JOIN schedules sc ON sc.movie_id = m.id
            JOIN locations l ON l.id = sc.location_id
            JOIN show_times st ON st.id = sc.time_id`;
        
        if(Object.keys(req.query).length === 3){
            const newStatus = status.split("%").join(" ");
            const newTime = time.split("%").join(" ");
            sql += ` WHERE ms.status = '${newStatus}' 
                    AND l.location = '${location}' 
                    AND st.time = '${newTime}'`;
        }
        if(Object.keys(req.query).length === 2){
            if(status && location){
                const newStatus = status.split("%").join(" ");
                sql += ` WHERE ms.status = '${newStatus}' 
                        AND l.location = '${location}'`;
            }
            if(status && time){
                const newStatus = status.split("%").join(" ");
                const newTime = time.split("%").join(" ");
                sql += ` WHERE ms.status = '${newStatus}' 
                        AND st.time = '${newTime}'`;
            }
            if(time && location){
                const newTime = time.split("%").join(" ");
                sql += ` WHERE st.time = '${newTime}' 
                        AND l.location = '${location}'`;
            }
        }
        if(Object.keys(req.query).length === 1){
            if(status){
                const newStatus = status.split("%").join(" ");
                sql += ` WHERE ms.status = '${newStatus}'`;
            }
            if(time){
                const newTime = time.split("%").join(" ");
                sql += ` WHERE st.time = '${newTime}'`;
            }
            if(location){
                sql += ` WHERE l.location = '${location}'`;
            }
        }
        const resp = await query(sql);

        return res.status(200).send(resp);
    }catch(err){
        return res.status(500).send(err);
    }
});

//For admin, please put the token in "body" not in authorization

//Admin tambahin film baru
router.post('/add', checkAdmin, async(req,res) => {
    try{
        const { role } = req.user;
        const { 
            name, 
            release_date, 
            release_month,
            release_year,
            duration_min,
            genre,
            description
        } = req.body;
        if(role === 1){
            const resp = await query(`INSERT INTO movies
            (name, release_date, release_month, release_year, duration_min, genre, description) 
            VALUES 
            ('${name}','${release_date}','${release_month}','${release_year}','${duration_min}','${genre}','${description}')`);

            const result ={
                id: resp.insertId,
                name: `${name}`, 
                release_date: release_date, 
                release_month: release_month, 
                release_year: release_year, 
                duration_min: duration_min, 
                genre: `${genre}`, 
                description: `${description}`
            };
            return res.status(200).send(result);
        }
    }catch(err){
        return res.status(500).send(err);
    }
})

//Admin edit status film
router.patch('/edit/:id', checkAdmin, async(req,res) =>{
    try{
        const { status } = req.body;
        const { id } = req.params;

        await query(`UPDATE movies SET status = '${status}' WHERE id = ${parseInt(id)}`);
        return res.status(200).send({
            id,
            message: 'Status has been changed'
        });
    }catch(err){
        return res.status(500).send(err);
    }
});

//Admin add schedule
router.patch('/set/:id', checkAdmin, async (req,res) => {
    try{
        const { location_id, time_id } = req.body;
        const { id } = req.params;

        const resp = await query(`INSERT INTO schedules(movie_id, location_id, time_id) 
        VALUES (${id}, ${location_id}, ${time_id})`);

        return res.status(200).send({
            id,
            message: 'schedule has been added'
        });
    }catch(err){
        return res.status(500).send(err);
    }
});

module.exports = router;