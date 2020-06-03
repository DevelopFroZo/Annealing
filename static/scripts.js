$(document).ready( () => {
    let socket = io()

    socket.on( "/api/annealing", data => {
        const { event: e, path, pathLength, Ti, i } = JSON.parse( data ) 
        console.log( data )
    } )

    $( "#mf" ).click( (e) => {
        let bt = $( "#mf" )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#ff" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", false )
        }
    } )

    $( "#ff" ).click( (e) => {
        let bt = $( "#ff" )

        if( bt.attr( "class" ) == "btn btn-secondary inputbt" ){
            bt.attr( "class", "btn btn-primary inputbt" )
            $( "#mf" ).attr( "class", "btn btn-secondary inputbt" )
            $( "#inputsettings" ).attr( "hidden", true )
        }
    } )

    $( '#stginp' ).change( (e) => {
    
        let tb = $( '#inputtb' )
        let size = $( '#stginp' ).val()

        tb.find( "tr" ).remove();
        let val = 0

        for( let i = 0; i < size; i++ ){
            let tr = $( "<tr>" );
            for( let j = 0; j < size; j++ ){
                let td = $( "<td>" );
                
                val = 0

                td.append( $( '<input>', {
                    "id" : i + "_" + j, 
                    "type" : "number",
                    "class" : "form-control inps",
                    "placeholder" : val,
                    "value" : val
                } ) )

                if( j == i ) td.find( "input" ).attr( "readonly", true )

                let input = td.find( "input" )
                input.change( (e) => {
                    let id = input.attr('id').split( "_" )
                    let newId = id[1] + "_" + id[0]
                    $( '#' + newId ).val( input.val() )
                } )

                tr.append( td )
            }
            tb.append( tr )
        }

        $( "#calculate" ).attr( "hidden", false )
    } )


    $( "#calculate" ).click( (e) => {
        let size = $( '#stginp' ).val()
        let id

        let data = []

        for( let i = 0; i < size - 1; i++ ){
            let d = []
            for( let j = i + 1; j < size; j++ ){
                id = i + "_" + j
                d.push( parseInt( $( "#" + id ).val() ) )
            }
            data.push( d ) 
        }

        console.log(  JSON.stringify(
            {
                data,
                Tmin : parseInt( $( '#tmin' ).val() ),
                Tmax : parseInt( $( '#tmax' ).val() ),
                N : parseInt( $( '#steps' ).val() ),
            }
        ) )
        
        socket.emit( "/api/annealing", JSON.stringify(
            {
                data,
                Tmin : parseInt( $( '#tmin' ).val() ),
                Tmax : parseInt( $( '#tmax' ).val() ),
                N : parseInt( $( '#steps' ).val() ),
            }
        ) )
    } )
} )