const baseURL = 'http://localhost:3000';

$(document).ready(function () {
  auth();

  $('#login-form').submit(function (e) {
    e.preventDefault();
    login();
  });

  $('#reg-btn').click(function (e) {
    e.preventDefault();
    $('#login-container').hide();
    $('#reg-container').show();
  });

  $('#cancel-btn').click(function (e) {
    e.preventDefault();
    auth();
  });

  $('#reg-form').submit(function (e) {
    e.preventDefault();
    register();
  });

  $('#logout-btn').click(function (e) {
    e.preventDefault();
    localStorage.removeItem('access_token');
    auth();
  });
});

function auth() {
  if (localStorage.getItem('access_token')) {
    $('#login-container').hide();
    $('#reg-container').hide();
    $('#todos-container').show();
    $('#logout').show();

    getTodos();
  } else {
    $('#login-container').show();
    $('#reg-container').hide();
    $('#todos-container').hide();
    $('#logout').hide();
  }
}

function getTodos() {
  $.ajax({
    type: 'GET',
    url: baseURL + '/todos',
    headers: {
      access_token: localStorage.getItem('access_token'),
    },
  })
    .done(({ data }) => {
      data.forEach((el) => {
        $('#todos').append(
          `<div class="list-group-item list-group-item-action">
          <input class="form-check-input me-1" type="checkbox" value="" aria-label="..." />
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${el.title}</h5>
            <small class="text-muted">3 days ago</small>
          </div>
          <p class="mb-1">${el.description}</p>
          <small>Due date: ${new Date(el.due_date).toISOString().split`T`[0]}</small><br />
          <button type="button" class="btn btn-sm btn-primary">Edit</button>
          <button type="button" class="btn btn-sm btn-danger">Delete</button>
        </div>`
        );
      });
    })
    .fail((err) => {
      console.log(err);
    });
}

function login() {
  $.ajax({
    type: 'POST',
    url: baseURL + '/users/login',
    data: {
      email: $('#email').val(),
      password: $('#password').val(),
    },
  })
    .done((res) => {
      localStorage.setItem('access_token', res.access_token);
      auth();
    })
    .fail((err) => {
      console.log(err);
    });
}

function register() {
  $.ajax({
    type: 'POST',
    url: baseURL + '/users/register',
    data: {
      email: $('#new-email').val(),
      password: $('#new-password').val(),
    },
  })
    .done((res) => {
      auth();
    })
    .fail((err) => {
      console.log(err);
    });
}
