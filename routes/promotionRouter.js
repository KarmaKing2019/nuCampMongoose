const express = require('express')
const Promotions = require('../models/promotion')
const authenticate = require('../authenticate')
const cors = require('./cors')

const promotionRouter = express.Router()

promotionRouter
  .route('/')

  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Promotions.find()
      .then(promotions => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotions)
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
      .then(promotion => {
        console.log('Partner Created', promotion)
        res.statusCode = 200
        res.setHeader('Content-type', 'application/json')
        res.json(promotion)
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /promotions')
  })
  .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.deleteMany()
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

promotionRouter
  .route('/:promotionId')

  .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res) => {
    Promotions.findByIdAndDelete(req.params.promotionId)
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
      .then(promotion => {
        if (promotion) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(promotion)
        } else {
          err = new Error(`Campsite ${req.params.promotionId} not found!!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })

  .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotions.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(promotion => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      })
      .catch(err => next(err))
  })

  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res) => {
    res.statusCode = 404
    res.end(
      `POST operation not supported on /campsites/${req.params.promotionId}`
    )
  })

module.exports = promotionRouter
