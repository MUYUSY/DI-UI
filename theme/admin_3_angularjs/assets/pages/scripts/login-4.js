var Login = function () {

	var handleLogin = function() {
		$('.login-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            rules: {
	                login: {
	                    required: true
	                },
	                password: {
	                    required: true
	                },
	                remember: {
	                    required: false
	                }
	            },

	            messages: {
	                login: {
	                    required: "请输入用户名!"
	                },
	                password: {
	                    required: "请输入密码!"
	                }
	            },

	            invalidHandler: function (event, validator) { //display error alert on form submit
					$('span', $('.alert-danger')).html('请输入用户名和密码!');
	                $('.alert-danger', $('.login-form')).show();
	            },

	            highlight: function (element) { // hightlight error inputs
	                $(element)
	                    .closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function (label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function (error, element) {
	                error.insertAfter(element.closest('.input-icon'));
	            },

	            submitHandler: function (form) {
	                form.submit();
	            }
	        });

	        $('.login-form input').keyup(function (e) {
	            if (e.which == 13) {
                    $('#login').submit();
	            }
	        });
	};
    
    return {
        //main function to initiate the module
        init: function () {
        	
            handleLogin();

            if ($('span', $('.alert-danger')).html() != '') {
            	$('.alert-danger', $('.login-form')).show();
            }

            // init background slide images
		    $.backstretch([
		        "../assets/pages/media/bg/1.jpg",
		        "../assets/pages/media/bg/2.jpg",
		        "../assets/pages/media/bg/3.jpg",
		        "../assets/pages/media/bg/4.jpg"
		        ], {
		          fade: 1000,
		          duration: 8000
		    	}
        	);
        }
    };

}();

jQuery(document).ready(function() {
    Login.init();
});