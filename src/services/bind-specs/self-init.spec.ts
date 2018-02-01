import { cacheDynamicTemplates } from '../../services/self-init'

/** <!> All events are suffixed by the `setupTemplate()` method with unique ids in order to prevent cross-talk between tests */
let mockTemplate = `
    <!-- Ignore comments -->

    <!-- Ignore tags starting with new line or white space -->
    < /br></ br>< meta><	meta>
    <
    a
    > 

    <mock-web-cmp class="parent">

        <!-- Ignore less than and greater than when between quotes -->
        <div class="t'e'a's' >d<f>s t" (input)='t"e"a"s" >d<f>s t'> </div>
        <div class='t"e"a"s" >d<f>s t' (input)="t'e'a's' >d<f>s t"> </div>

        <!-- Include multiline div with mixed quotes -->
        <div
            id="test" 
            class="child" 
            e-for="mockEvent1, event.detail"> 

            <!-- Include css classes -->
            <div class="item"> </div>
            <base class="test" />
            
            <div class=> </div> 

            <!-- Ignore text and greater less than synmbols -->
            some> text > with> brackets
            more>confusing<>text
            test
            <_input><!><+"*ç%&/()=?¦@#°§¬|¢´~>

            <!-- Various spacing and closings of tags -->
            <br> <br/> <br /> <br / > <br	/	> <br	/	>

            <span>

                <!-- Ignore singletones tags when counting pairs -->
                <area> <base> <br> <col> <embed> <hr> <img> <input> 
                <keygen> <link> <meta> <param> <source> <track> <wbr>

                <asp:Label ID="CustomerNameLabel" runat="server" 
                        Text='<%#Eval("CustomerName") %>' >
                <web-cmp> <!-- Ignore unclosed tag when counting pairs (chrome autocloses) -->

                <!-- Ignore stamdalome tag names -->
                div, p, a, table, button, web-component class="dummy"
                area, base, br, col, embed, hr, img, input, 
                keygen, link, meta, param, source, track, wbr

            </span>
                                        
        </div>
    </mock-web-cmp>
`

// TODO, find better approach or completely remove tpl attribute
let expectedTemplate = `
    <!-- Ignore comments -->

    <!-- Ignore tags starting with new line or white space -->
    < /br></ br>< meta><	meta>
    <
    a
    > 

    <mock-web-cmp class="parent">

        <!-- Ignore less than and greater than when between quotes -->
        <div class="t'e'a's' >d<f>s t" (input)='t"e"a"s" >d<f>s t'> </div>
        <div class='t"e"a"s" >d<f>s t' (input)="t'e'a's' >d<f>s t"> </div>

        <!-- Include multiline div with mixed quotes -->
        <div
            id="test" 
            class="child" 
            e-for="mockEvent1, event.detail" tpl="2"></div>
    </mock-web-cmp>
`

// Common specs for all data binds
describe('Self init', () => {

    it('Automatically adds data binds when element is added in the DOM', () => {
        expect(cacheDynamicTemplates(mockTemplate)).toEqual(expectedTemplate)
    })

    xit('Multiple dynamic templates can be cached', () => {})
    xit('Constructor is not executed prematurely', () => {})
    xit('If rule still works', () => {})
    xit('For rule still works', () => {})

})
