import React from 'react';
import { Field, reduxForm, reset } from 'redux-form/dist/redux-form';
import TextField from '@mui/material/TextField';
import Grid from "@mui/material/Grid";

const renderTextField = (
  { input, label, ...custom },
) => (
  <TextField {...input} {...custom} />
);

const adaptFileEventToValue = delegate => e => delegate(e.target.files[0]);

const FileInput = ({
 input: { value: omitValue, onChange, onBlur },
 meta: omitMeta,
 ...props
}) => (
  <input
    onChange={adaptFileEventToValue(onChange)}
    onBlur={adaptFileEventToValue(onBlur)}
    type="file"
    {...props.input}
    {...props}
  />
);

const $UploadForm = ({ handleSubmit, isLoading, pristine, reset, submitting }) => (
  <form onSubmit={handleSubmit}>
    <Grid container direction="column" justifyContent="space-evenly" alignItems="center" rowSpacing="2">
      <Grid item>
        <label>NFT Number</label>
         <Field name="nftNumber" component={renderTextField} label="NFT Number" />
      </Grid>
      <Grid item>
        <label>NFT Image</label>
        <Field name="nftImage" component={FileInput} type="file" label="NFT Image" />
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item>
            <button type="submit" disabled={pristine || submitting || isLoading}>Upload</button>
          </Grid>
          <Grid item>
            <button type="button" disabled={pristine || submitting || isLoading} onClick={reset}>Reset</button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </form>
);

const afterSubmit = (result, dispatch) =>
  dispatch(reset('uploadForm'));

export const UploadForm = reduxForm({
  form: 'uploadForm',
  onSubmitSuccess: afterSubmit
})($UploadForm);