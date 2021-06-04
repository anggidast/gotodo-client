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

  $('#add-btn').click(function (e) {
    e.preventDefault();
    $('#add-container').show();
  });

  $('#cancel-add-btn').click(function (e) {
    e.preventDefault();
    $('#add-container').hide();
  });

  $('#add-form').submit(function (e) {
    e.preventDefault();
    addTodo();
    $('#add-container').hide();
  });

  $('#todos').on('click', '.edit-btn', function (e) {
    e.preventDefault();
    const id = $(this).data().id;
    showEditTodo(id);
    $('#edit-container').show();
    $(window).scrollTop(0);
    $('#submit-edit-btn').attr('data-id', id);
  });

  $('#edit-form').submit(function (e) {
    e.preventDefault();
    const id = $('#submit-edit-btn').data().id;
    editTodo(id);
    $('#edit-container').hide();
  });

  $('#cancel-edit-btn').click(function (e) {
    e.preventDefault();
    $('#edit-container').hide();
  });

  $('#todos').on('click', '.delete-btn', function (e) {
    e.preventDefault();
    const id = $(this).data().id;
    deleteTodo(id);
  });
});

function auth() {
  if (localStorage.getItem('access_token')) {
    $('#login-container').hide();
    $('#reg-container').hide();
    $('#todos-container').show();
    $('#logout').show();
    $('#add-container').hide();
    $('#edit-container').hide();

    getTodos();
  } else {
    $('#login-container').show();
    $('#reg-container').hide();
    $('#todos-container').hide();
    $('#add-container').hide();
    $('#edit-container').hide();
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
      $('#todos').empty();
      data.forEach((el) => {
        $('#todos').append(
          `<div class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="" />
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${el.title}</h5>
              <small class="text-muted">3 days ago</small>
            </div>
            <p class="mb-1">${el.description}</p>
            <small>Due date: ${new Date(el.due_date).toISOString().split`T`[0]}</small><br />
            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${el.id}">Edit</button>
            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${el.id}">Delete</button>
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

function addTodo() {
  $.ajax({
    type: 'POST',
    url: baseURL + '/todos',
    headers: {
      access_token: localStorage.getItem('access_token'),
    },
    data: {
      title: $('#title').val(),
      description: $('#description').val(),
      due_date: $('#due_date').val(),
    },
  })
    .done((res) => {
      getTodos();
    })
    .fail((err) => {
      console.log(err);
    });
}

function showEditTodo(id) {
  $.ajax({
    type: 'GET',
    url: baseURL + '/todos/' + id,
    headers: {
      access_token: localStorage.getItem('access_token'),
    },
  })
    .done(({ data }) => {
      $('#title-edit').val(data.title);
      $('#description-edit').val(data.description);
      $('#due_date-edit').val(new Date(data.due_date).toISOString().split`T`[0]);
    })
    .fail((err) => {
      console.log(err);
    });
}

function editTodo(id) {
  $.ajax({
    type: 'PUT',
    url: baseURL + '/todos/' + id,
    headers: {
      access_token: localStorage.getItem('access_token'),
    },
    data: {
      title: $('#title-edit').val(),
      description: $('#description-edit').val(),
      due_date: $('#due_date-edit').val(),
    },
  })
    .done((res) => {
      getTodos();
    })
    .fail((err) => {
      console.log(err);
    });
}

function deleteTodo(id) {
  $.ajax({
    type: 'DELETE',
    url: baseURL + '/todos/' + id,
    headers: {
      access_token: localStorage.getItem('access_token'),
    },
  })
    .done((res) => {
      getTodos();
    })
    .fail((err) => {
      console.log(err);
    });
}
