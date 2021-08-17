const baseURL = 'https://gotodo-api.herokuapp.com';
// const baseURL = 'http://localhost:34547';

$(document).ready(function () {
  auth();

  $('#login-form').submit(function (e) {
    e.preventDefault();
    login();
  });

  $('#reg-btn').click(function (e) {
    e.preventDefault();
    $('#login-container').hide();
    $('#reg-alert').hide();
    $('#reg-container').show();
    $('#reg-form')[0].reset();
  });

  $('#cancel-btn').click(function (e) {
    e.preventDefault();
    auth();
    $('#login-form')[0].reset();
  });

  $('#reg-form').submit(function (e) {
    e.preventDefault();
    register();
  });

  $('#logout-btn').click(function (e) {
    e.preventDefault();
    localStorage.removeItem('access_token');
    // signOut();
    auth();
    $('#login-form')[0].reset();
  });

  $('.add-btn').click(function (e) {
    e.preventDefault();
    $('#add-container').show();
    $('#add-form')[0].reset();
    $('#due_date').attr('min', new Date().toISOString().split('T')[0]);
    $('#todo-alert').hide();
    $('#add-alert').hide();
    $('.cancel-btn').show();
  });

  $('.cancel-btn').click(function (e) {
    e.preventDefault();
    $('#add-container').hide();
    $('#edit-container').hide();
  });

  $('#add-form').submit(function (e) {
    e.preventDefault();
    addTodo();
  });

  $('#todos').on('click', '.edit-btn', function (e) {
    e.preventDefault();
    const id = $(this).data().id;
    showEditTodo(id);
    $('#edit-container').show();
    $('.cancel-btn').show();
    $('#edit-alert').hide();
    $('#due_date-edit').attr('min', new Date().toISOString().split('T')[0]);
    $(window).scrollTop(0);
    $('#submit-edit-btn').attr('data-id', id);
  });

  $('#edit-form').submit(function (e) {
    e.preventDefault();
    const id = $('#submit-edit-btn').data().id;
    editTodo(id);
  });

  $('#todos').on('click', '.delete-btn', function (e) {
    e.preventDefault();
    const id = $(this).data().id;
    const title = $(this).data().title;
    deleteTodo(id, title);
  });

  $('#todos').on('click', '.status-btn', function (e) {
    e.preventDefault();
    const id = $(this).data().id;
    const status = $(this).data().status;
    if (status == 'undone') {
      statusChange(id, 'done');
    } else {
      statusChange(id, 'undone');
    }
  });

  $('#download-btn').click(function (e) {
    e.preventDefault();
    download();
  });

  $('#home-btn').click(function (e) {
    e.preventDefault();
    auth();
  });

  $('#city-search').submit(function (e) {
    e.preventDefault();
    const city = $('#city').val();
    searchCity(city);
  });
});

function auth() {
  if (localStorage.getItem('access_token')) {
    $('#login-container').hide();
    $('#reg-container').hide();
    $('#no-todo').hide();
    $('#todo-alert').hide();
    $('#todos-container').show();
    $('#logout').show();
    $('#add-container').hide();
    $('#edit-container').hide();
    $('#navbar').show();
    $('#weather-container').show();

    searchCity('Jakarta');
    getTodos();
  } else {
    $('#login-container').show();
    $('#login-form')[0].reset();
    $('#success-alert').hide();
    $('#error-alert').hide();
    $('#reg-container').hide();
    $('#todos-container').hide();
    $('#add-container').hide();
    $('#edit-container').hide();
    $('#logout').hide();
    $('#navbar').hide();
    $('#weather-container').hide();
  }

  // FB.getLoginStatus(function (response) {
  //   statusChangeCallback(response);
  // });
}

// function checkLoginState() {
//   FB.getLoginStatus(function (response) {
//     console.log(response);
//     statusChangeCallback(response);
//   });
// }

function onSignIn(googleUser) {
  const id_token = googleUser.getAuthResponse().id_token;
  $.ajax({
    type: 'POST',
    url: baseURL + '/users/google-login',
    data: {
      token: id_token,
    },
  })
    .done((res) => {
      localStorage.setItem('access_token', res.access_token);
      auth();
    })
    .fail((err) => console.log(err));
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}

function login() {
  const data = {
    email: $('#email').val(),
    password: $('#password').val(),
  };

  $.ajax({
    type: 'POST',
    url: baseURL + '/users/login',
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  })
    .done((res) => {
      localStorage.setItem('access_token', res.access_token);
      auth();
    })
    .fail((err) => {
      $('#error-alert').show().text(err.responseJSON.message);
      $('#success-alert').hide();
    });
}

function register() {
  const data = {
    email: $('#new-email').val(),
    password: $('#new-password').val(),
  };

  $.ajax({
    type: 'POST',
    url: baseURL + '/users/register',
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  })
    .done((res) => {
      auth();
      $('#success-alert').show().text('Register success\nYou can login now!');
    })
    .fail((err) => {
      $('#reg-alert').show().text(err.responseJSON.message);
    });
}

function getTodos() {
  $.ajax({
    type: 'GET',
    url: baseURL + '/todos',
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })
    .done(({ data }) => {
      if (data.length == 0) {
        const oneDay = 24 * 60 * 60 * 1000;
        const due_date = `${Math.round(new Date() + oneDay)}`;
        $('#todos-container').hide();
        $('#add-container').show();
        $('#due_date').attr('min', due_date);
        $('#add-alert').hide();
        $('#no-todo').show();
        $('#add-form')[0].reset();
        $('.cancel-btn').hide();
      }
      $('#todos').empty();
      data.forEach((el) => {
        const due_date = `${el.due_date}`;
        const statusButton = el.status == 'done' ? 'Undone' : 'Done';
        const done = el.status == 'done' ? 'text-black-50' : '';
        const due = dayCount(new Date(el.due_date), new Date());
        $('#todos').append(
          `<div class="list-group-item d-flex justify-content-between">
              <div class="w-100">
                <h5 class="mb-1 ${done}">${el.title}</h5>
                <p class="mb-1 ${done}">${el.description}</p>
                <small class="${done}">Due date: ${due_date.split`T`[0]}</small><br />
              </div>

              <div class="d-flex flex-column justify-content-between">
              <small class="text-muted text-end">${due >= 0 ? due + 1 + ' day(s) left' : 'expired!'}</small>
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="button" class="btn btn-sm btn-success status-btn" data-id="${el.id}" data-status="${el.status}" data-title="${
            el.title
          }">${statusButton}</button>
                <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${el.id}" data-title="${el.title}">Delete</button>
                <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${el.id}">Edit</button>
                <!-- <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${el.id}">Edit</button> -->
              </div>
              </div>
          </div>`
        );
      });
    })
    .fail((err) => {
      console.log(err);
    });
}

function dayCount(due_date, today) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((due_date - today) / oneDay);
}

function addTodo() {
  const data = {
    title: $('#title').val(),
    description: $('#description').val(),
    due_date: $('#due_date').val(),
  };

  $.ajax({
    type: 'POST',
    url: baseURL + '/todos',
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      'Content-Type': 'application/json',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
    data: JSON.stringify(data),
  })
    .done((res) => {
      getTodos();
      $('#add-container').hide();
      $('#todos-container').show();
      $('#todo-alert')
        .show()
        .text('New todo: "' + res.data.title + '" added successfully');
    })
    .fail((err) => {
      console.log(err);
      $('#add-alert').show().text(err.responseJSON.message);
    });
}

function showEditTodo(id) {
  $.ajax({
    type: 'GET',
    url: baseURL + '/todos/' + id,
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })
    .done(({ data }) => {
      const due_date = `${data.due_date}`;
      $('#title-edit').val(data.title);
      $('#description-edit').val(data.description);
      $('#due_date-edit').val(due_date.split`T`[0]);
    })
    .fail((err) => {
      console.log(err);
    });
}

function editTodo(id) {
  const data = {
    title: $('#title-edit').val(),
    description: $('#description-edit').val(),
    due_date: $('#due_date-edit').val(),
  };

  $.ajax({
    type: 'PUT',
    url: baseURL + '/todos/' + id,
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      'Content-Type': 'application/json',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
    data: JSON.stringify(data),
  })
    .done((res) => {
      getTodos();
      $('#edit-container').hide();
      $('#todo-alert')
        .show()
        .text('Todo: "' + res.data.title + '" updated successfully');
    })
    .fail((err) => {
      $('#edit-alert').show().text(err.responseJSON.message);
    });
}

function deleteTodo(id, title) {
  swal({
    title: `Are you sure you want to delete "${title}" from todo?`,
    text: 'Once deleted, you will not be able to recover this todo!',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      $.ajax({
        type: 'DELETE',
        url: baseURL + '/todos/' + id,
        headers: {
          'Access-Control-Allow-Origin': 'x-requested-with',
          access_token: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
        .done((res) => {
          swal(title + ' has been deleted!', {
            icon: 'success',
          });
          getTodos();
        })
        .fail((err) => {
          console.log(err);
        });
    }
  });
}

function statusChange(id, status) {
  const data = {
    status: status,
  };
  $.ajax({
    type: 'PATCH',
    url: baseURL + '/todos/' + id,
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      'Content-Type': 'application/json',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
    data: JSON.stringify(data),
  })
    .done(() => {
      getTodos();
    })
    .fail((err) => {
      console.log(err);
    });
}

function download() {
  $.ajax({
    type: 'GET',
    url: baseURL + '/todos/export',
    headers: {
      'Access-Control-Allow-Origin': 'x-requested-with',
      access_token: `Bearer ${localStorage.getItem('access_token')}`,
    },
    xhrFields: {
      responseType: 'blob',
    },
    success: function (response, status, xhr) {
      var a = document.createElement('a');
      var url = window.URL.createObjectURL(response);
      a.href = url;
      a.download = 'todo.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });
  // .done((res) => {
  //   auth();
  //   console.log(res, 'done');
  // })
  // .fail((err) => console.log(err, 'err'));
}

function searchCity(city) {
  $.ajax({
    type: 'GET',
    url: `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=wVoG6Um0IAAWs4G7DdbXUleqC5dx1EgM&q=${city}`,
  }).done((data) => {
    const id = data[0].Key || data.Key;
    const cityName = data[0].LocalizedName || data.LocalizedName;
    weather(id, cityName);
  });
}

function weather(id, city) {
  $.ajax({
    type: 'GET',
    url: `http://dataservice.accuweather.com/currentconditions/v1/${id}?apikey=wVoG6Um0IAAWs4G7DdbXUleqC5dx1EgM`,
  }).done((data) => {
    $('#city-search')[0].reset();
    const condition = data[0].WeatherText;
    const temp = data[0].Temperature.Metric.Value;
    $('#weather').text(city + ': ' + condition + ', ' + temp + String.fromCharCode(176) + 'C');
  });
}
