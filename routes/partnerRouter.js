const express = require('express')
const partnerRouter = express.Router()

partnerRouter
  .route('/')

  .all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.end('Will send all the partners to you')
  })
  .post((req, res) => {
    res.end(
      `Will add the partner: ${req.body.name} with description: ${req.body.description}`
    )
  })
  .put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /partners')
  })
  .delete((req, res) => {
    res.end('Deleting all partners')
  })

partnerRouter
  .route('/:partnerId')

  .delete((req, res) => {
    res.end(`Deleting cc partner: ${req.params.partnerId}`)
  })

  .get((req, res) => {
    res.end(
      `Will send details of the partner: ${req.params.partnerId} to you`
    )
  })

  .put((req, res) => {
    res.write(`Updating the partner: ${req.params.partnerId}\n`)
    res.end(`Will update the partner: ${req.body.name}
        with description: ${req.body.description}`)
  })

  .post((req, res) => {
    res.statusCode = 403
    res.end(
      `POST operation not supported on /partners/${req.params.partnerId}`
    )
  })

module.exports = partnerRouter
