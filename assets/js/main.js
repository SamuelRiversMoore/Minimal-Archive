$(function() {
    $('img').on('click', function(event) {

        //preparing the breaker
        var target = $(this).parent().prev();
        if (target.attr("id") == "breaker") {
            target = $('#breaker').prev();
        }

        // small/large size behavior on click
        if ($(this).parent().hasClass('small')) {

            //resetting images size to small
            $('.large').removeClass('large').addClass('small');

            //adding the large image class to the selected image
            $(this).parent().removeClass('small').addClass('large');

            //appending the breaker
            $('#breaker').insertBefore(target);

            //scrolling to the enlarged image
            $('html, body').animate({
                scrollTop: $(".large").offset().top
            }, 150);
        }
        // if the image is large, the click turns it small
        else {
            $(this).parent().removeClass('large').addClass('small');
            $('#breaker').appendTo('main');
        }
    });

    // keyboard behavior. Basically triggering the clicks on the images.
    $("body").keydown(function(e) {
        if (e.keyCode == 37) { // left key
            $('.large').prev('.img').find('img').click();
            console.log('left');
            console.log($('.large').prev('.img'))
        } else if (e.keyCode == 39) { // right
            $('.large').next('.img').find('img').click();
            console.log('right');
            console.log($('.large').next('.img'))
        } else if (e.keyCode == 27) { // escape key
            $('.large').find('img').click();
            $('html, body').animate({
                scrollTop: 0
            }, 150);
        }
    });

    // bad lazyload fix
    setTimeout(function() {
        $(window).resize()
    }, 300);
});

$(document).ready(function() {
    $(".lazy").lazyload({
        effect: "fadeIn"
    });
})
