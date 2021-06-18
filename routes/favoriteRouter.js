const express = require('express')
const Favorite = require('../models/favorite')
const Campsite = require('../models/campsite')

const authenticate = require('../authenticate')
const { verify } = require('jsonwebtoken')
const cors = require('./cors')
const { json } = require('express')

const favoriteRouter = express.Router()

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .populate('comments.author')
      .then(campsites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsites)
      })
      .catch(err => next(err))
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log({ user: req.user._id })
      Favorite.findOne({ user: req.user._id })
        .then(favorite => {
          if (favorite) {
            // CHECK campsiteIds against Favorites
            let isModified = false
            req.body.map(idVal => {
              console.log(idVal._id)
              console.log(favorite.campsites.includes(idVal._id))
              if (!favorite.campsites.includes(idVal._id)) {
                console.log('filtering ...')
                // Add id
                isModified = true
                favorite.campsites.push(idVal._id)
              }
            })

            if (isModified) {
              console.log('...saving')
              favorite.markModified('campsites')

              favorite
                .save()

                .then(favorite => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(favorite)
                })
                .catch(err => next(err))
            } else {
              res.statusCode = 403
              res.end(`Already a favorite campsite`)
            }
          } else {
            // IF NO FAVORITES DOC FOUND ... CREATE ONE
            console.log('... creating favorite document')
            Favorite.create(req).then(favorite => {
              console.log('... adding campsiteIds')

              req.body.map(campId => {
                console.log(campId._id)
                favorite.campsites.push(campId._id)
              })
              console.log(favorite.campsites)

              favorite.markModified('campsites')

              favorite
                .save()

                .then(favorite => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(favorite)
                })
                .catch(err => next(err))
            })
            console.log('FAVORITE DOC CREATED!!!')
          }
        })
        .catch(err => next(err))
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403
      res.end(`GET not supported.`)
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOneAndDelete({ user: req.user._id }).then(favorite => {
        if (favorite) {
          console.log('You got something to delete')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(favorite)
        } else {
          console.log('You cant delete nothing')
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end(`You do not have any favorites to delete.`)
        }
        //console.log(favorite)
      })
    }
  )
//Favorite.findOneAndDelete({ user: req.user._id })

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`GET not supported.`)
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      // SEARCH FOR EXISTING FAV DOCUMENT
      Favorite.findOne({ user: req.user._id }).then(favorite => {
        // ### ( CONFIRM FAVORITE DOC ) #############
        if (favorite) {
          console.log('?? >> FOUND A FAV DOC')
          console.log(typeof req.params.campsiteId)

          // VERIFY IF URL CAMPSITE ID EXISTS
          const isMatch = favorite.campsites.includes(req.params.campsiteId)

          console.log('isMatch : ' + isMatch)

          // IF DOES NOT EXIST ADD TO FAVORITES
          if (!isMatch) {
            console.log('ADDING ... ')
            favorite.campsites.push(req.params.campsiteId)
            favorite.markModified('campsites')

            favorite
              .save()
              .then(favorite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json('Successfully ADDED :' + favorite)
              })
              .catch(err => next(err))
          } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end(`That campsite is already in the list of favorites!`)
          }
        } else {
          // ### ( NO FAV DOC FOUND .. CREATE ONE ) #######
          console.log('I need to create a FAV DOC ')
          Favorite.create(req).then(favorite => {
            favorite.campsites.push(req.params.campsiteId)

            console.log(favorite.campsites)

            favorite.markModified('campsites')

            favorite
              .save()

              .then(favorite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
              })
              .catch(err => next(err))
          })
        }
      })
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403
      res.end(`GET not supported.`)
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) =>
      // find user favorite docs
      Favorite.findOne({ user: req.user._id })
        .then(favorite => {
          // CHECK FOR A FAV DOC
          if (favorite) {
              console.log('BEFORE: ' + favorite.campsites)

            console.log('there is a favorite')

            // FILTER CAMPSITES BASED ON SUBMISSION
            const filteredFav = favorite.campsites.filter(favCamp => {
              if (!(favCamp.toString() === req.params.campsiteId)) {
                return favCamp
              }
            })
            favorite.campsites = filteredFav
            console.log('AFTER : ' + favorite.campsites)
            // SAVE
            favorite.markModified('campsites')

            favorite.save()

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json('Successfully Deleted:' + favorite)

          } else {
            // LET USER KNOW THERE IS NO FAV DOC
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end(`No favorites to delete`)
          }
        })
        .catch(err => next(err))
  )

module.exports = favoriteRouter
