
$( document ).ready(function() {
    $('#addNeed').click(function () {
        $('#myType').val('besoin');
        $('#titleModalAddExchange').text('Ajout d\'un besoin');
    });
    $('#addSurplus').click(function () {
        $('#myType').val('surplus');
        $('#titleModalAddExchange').text('Ajout d\'un surplus');
    });
    $('#buttonPwd').click(function () {
        let myEntry = $('#password');
        if(myEntry.prop('type') === 'password'){
            myEntry.prop('type','text');
            $(this).text('Cacher')
        }
        else{
            myEntry.prop('type','password');
            $(this).text('Afficher')
        }
    }
    );
});

