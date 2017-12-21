//SurveyNew shows SurveyForm and SurveyFormReview
import React, { Component } from 'react';

import SurveyForm from './SurveyForm';
import SurveyFormReview from './SurveyFormReview';

import { reduxForm } from 'redux-form';

class SurveyNew extends Component {
  //constructor(props) {
  //  super(props);
  //  this.state = { new: true };
  //}  //replace by below short line.
  
  state = { showFormReview: false};
  
  renderContent() {
    if (this.state.showFormReview) {
      return 
        (<SurveyFormReview 
          onCancel={() => this.setState({ showFormReview: false })}
        />
      );
    }
    return (
      <SurveyForm 
        onSurveySubmit={() => this.setState({ showFormReview: true })}
      />
    );
  }
  
  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}

//hookup the reduxForm helper.
export default reduxForm({
  form: 'surveyForm'
})(SurveyNew);