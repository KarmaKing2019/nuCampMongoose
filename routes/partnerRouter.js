const express = require('express')
const Partners = require('../models/partners')

const partnerRouter = express.Router()

partnerRouter
  .route('/')

  .get((req, res, next) => {
    Partners.find()
      .then(campsites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsites)
      })
      .catch(err => next(err))
  })
  .post((req, res, next) => {
    Partners.create(req.body)
      .then(partner => {
        console.log('Partner Created', partner)
        res.statusCode = 200
        res.setHeader('Content-type', 'application/json')
        res.json(partner)
      })
      .catch(err => next(err))
  })
  .put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /partners')
  })
  .delete((req, res, next) => {
    Partners.deleteMany()
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

partnerRouter
  .route('/:partnerId')

  .delete((req, res) => {
    Partners.findByIdAndDelete(req.params.partnerId)
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

  .get((req, res) => {
    Partners.findById(req.params.partnerId)
      .then(partner => {
        if (partner) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(partner)
        } else {
          err = new Error(`Campsite ${req.params.partnerId} not found!!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })

  .put((req, res) => {
    Partners.findByIdAndUpdate(
      req.params.partnerId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(partner => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(partner)
      })
      .catch(err => next(err))
  })

  .post((req, res) => {
    res.statusCode = 404
    res.end(
      `POST operation not supported on /campsites/${req.params.partnerId}`
    )
  })

module.exports = partnerRouter
