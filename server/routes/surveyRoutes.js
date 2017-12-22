const _ = require('lodash');
const Path = require('path-parser');
const { URL } = rquire('url');

const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const Survey = mongoose.model('surveys');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

module.exports = app => {

  app.get('/api/surveys', requireLogin, async (req, res) {
    const surveys = await Survey.find({ _user: req.user.id }).select({ 
      recipients: false 
    });
    
    res.send(surveys);
  });
  
  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.send('Thanks for voting!!');
  });
  
  app.post('/api/surveys/webhooks', (res, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');
    
    _.chain(req.body)  //lodash chain!
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
        return { email, surveyId: match.surveyId, choice: match.choice};
        }
      })
      .compact() //kick out undefined.
      .uniqBy('email', 'surveyId')  //find unique
      .each(({ serveyId, email, choice}) => {  //de structure event
        Survey.updateOne(  //update statement in mongodb
          {
            _id: surveyId,  //id should be _id, mongo rule
            recipients: {
              $elemMatch: { email: email, responded: false }
            }
          }, {
            $inc: { [choice]: 1 },
            $set: { 'recipients.$.responded': true },
            lastResponded: new Date()
          }
        ).exec();  //call exec() to execute the query.
      })
      .value();
    
    res.send({});
  });

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;
    
    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      _user: req.user.id,
      dataSent: Date.now()
    });
    
    //send email
    const mailer = new Mailer(survey, surveytemplate(survey));
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();
    
      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
};