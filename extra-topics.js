// Seven additional topics; five questions at each of five difficulty tiers.
Object.assign(REFERENCES, {
  'Node.js':'https://nodejs.org/api/',
  HTML:'https://html.spec.whatwg.org/multipage/',
  KQL:'https://learn.microsoft.com/en-us/kusto/query/',
  Swift:'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/',
  Kotlin:'https://kotlinlang.org/docs/home.html',
  Go:'https://go.dev/ref/spec',
  R:'https://stat.ethz.ch/R-manual/R-devel/doc/manual/R-lang.html'
});
Object.assign(CONTEXT, {
  'Node.js':'Assume a supported modern Node.js runtime; module format is stated when relevant.',
  HTML:'Assume a modern browser parsing HTML, not XHTML.',
  KQL:'Use Microsoft Kusto Query Language, not Kibana Query Language. Tables and columns in fragments are assumed to exist.',
  Swift:'Assume Swift 6, appropriate enclosing functions and imports; async examples use an async context.',
  Kotlin:'Assume Kotlin/JVM and appropriate imports; coroutine examples use kotlinx.coroutines.',
  Go:'Assume Go 1.22 or later, required imports, and appropriate enclosing functions.',
  R:'Assume base R unless otherwise stated.'
});
pack('Node.js',1,[
 ["Read an Environment Value",'console.log(____.env.MODE);','process',null,'process.env exposes the process environment; a missing variable produces undefined.','Use Node’s process object.'],
 ["Export a CommonJS Value",'// CommonJS file\n____ = {port: 8080};','module.exports',null,'module.exports is the value returned when another CommonJS module requires this module.'],
 ["Import a Built-in Module",'// CommonJS file\nconst path = require("node:path");\nconsole.log(typeof path.join);','function',['string','undefined','object'],'The path module exports join as a function for composing paths.'],
 ["Read Command-Line Arguments",'// Run: node app.js hello\nconsole.log(process.argv[2]);','hello',['app.js','node','undefined'],'argv contains the executable path, script path, then the user-supplied arguments.'],
 ["Read a File as Text",'import {readFile} from "node:fs/promises";\nconst text = await readFile("notes.txt", ____);','"utf8"',null,'An encoding asks readFile to return a string rather than a Buffer.','Supply the UTF-8 encoding name.']
]);
pack('Node.js',2,[
 ["Handle a File-Read Rejection",'try {\n  await readFile("missing.txt", "utf8");\n} catch (error) {\n  console.log(error.code);\n}\n// The file does not exist.','ENOENT',['200','null','The rejection cannot be caught'],'Missing file paths commonly reject with the ENOENT system error code.'],
 ["Write an HTTP Response",'import {createServer} from "node:http";\ncreateServer((req, res) => {\n  res.____("hello");\n}).listen(8080);','end',null,'response.end finishes the response, optionally sending the final body chunk.'],
 ["Listen for a Named Event",'const emitter = new EventEmitter();\nemitter.on("ready", () => console.log("go"));\nemitter.emit("ready");','Prints go synchronously during emit',['Prints only on the next timer tick','Never calls the listener','Requires await emit()'],'EventEmitter calls registered ordinary listeners synchronously when emit is invoked.'],
 ["Buffer Byte Length",'console.log(Buffer.from("é", "utf8").length);','2',['1','4','undefined'],'The character takes two UTF-8 bytes; Buffer.length measures bytes.'],
 ["Resolve a Filesystem Path",'path.resolve("/tmp", "app", "config.json")','An absolute path to /tmp/app/config.json on POSIX',['A URL beginning https','Always a relative path','Reads the file contents'],'path.resolve produces an absolute filesystem path using platform rules; it does not perform I/O.']
]);
pack('Node.js',3,[
 ["Respect Writable-Stream Backpressure",'if (!destination.write(chunk)) {\n  // What event should we wait for before resuming writes?\n}','drain',['finish','data','close'],'A false return signals that the writable buffer reached its threshold; drain indicates writes can resume.'],
 ["Pipe With Coordinated Errors",'import {____} from "node:stream/promises";\nawait ____(source, transform, destination);','pipeline',null,'The promise-based pipeline connects streams and coordinates completion and error handling.'],
 ["CommonJS Modules Are Cached",'// counter.cjs logs "loaded" at its top level.\nrequire("./counter.cjs");\nrequire("./counter.cjs");','Normally logs loaded once for the same resolved filename',['Always twice','Never executes the file','Only caches JSON modules'],'CommonJS usually caches by resolved filename after the first successful load.'],
 ["Do Not Block the Event Loop",'httpServer.on("request", () => {\n  performHugeSynchronousCalculation();\n});','The calculation delays other event-loop work in that thread',['Each request gets its own OS thread automatically','Synchronous work never affects I/O callbacks','Node cancels the calculation automatically'],'Long synchronous work blocks callback processing. Consider worker threads or another suitable execution design.'],
 ["Set the Response Status",'res.____ = 404;\nres.end("Not found");','statusCode',null,'statusCode sets the outgoing status before headers are sent.']
]);
pack('Node.js',4,[
 ["Handle EventEmitter Errors",'const e = new EventEmitter();\ne.emit("error", new Error("boom"));\n// No error listener or enclosing catch.','Throws and can terminate the process',['Silently ignores the event','Always converts it to a warning only','Automatically retries the listener'],'The error event has special behavior when there is no listener.'],
 ["CPU Work in Worker Threads",'// A worker_threads Worker performs a heavy calculation.','Can execute JavaScript in a separate thread rather than on the main event loop',['Shares all ordinary JavaScript objects by reference automatically','Replaces every async filesystem operation','Runs only when the main thread is idle'],'Workers have separate JavaScript execution environments; messaging, transfer, or shared memory coordinates data.'],
 ["ES Modules Do Not Define Require",'// app.mjs\nconst fs = require("node:fs");','require is not defined by default; use import or createRequire',['Every .mjs file is CommonJS','The code always imports fs normally','require is a reserved syntax keyword'],'ES modules use import. createRequire can explicitly provide CommonJS loading when needed.'],
 ["Abort a Supported Asynchronous Operation",'const controller = new AbortController();\nconst result = readFile("large.txt", {signal: controller.signal});\ncontroller.abort();','The operation can reject with AbortError',['Every OS read is guaranteed undone','The result must resolve with empty text','Abort deletes the source file'],'Supported APIs accept an abort signal, but abort does not promise reversal of already-performed effects or OS requests.'],
 ["An Unref Timer Does Not Keep Node Alive",'setTimeout(() => console.log("later"), 60000).unref();\n// No other work keeps the process alive.','The process may exit before the timer callback runs',['The callback runs immediately','The timer keeps the process alive for a minute','unref cancels the timer unconditionally'],'unref removes the timer’s contribution to keeping the event loop alive; it can still fire if other work keeps the process running.']
]);
pack('Node.js',5,[
 ["CommonJS nextTick Versus Promise Jobs",'// Top-level CommonJS module:\nPromise.resolve().then(() => console.log("promise"));\nprocess.nextTick(() => console.log("tick"));\nconsole.log("sync");','sync, tick, promise',['sync, promise, tick','tick, sync, promise','promise, tick, sync'],'At this CommonJS boundary, nextTick callbacks run before the promise microtask queue. Top-level ES module ordering can differ.'],
 ["Recursive nextTick Can Starve I/O",'function loop() { process.nextTick(loop); }\nloop();','Can prevent the event loop from progressing to I/O callbacks',['Yields to I/O after every callback','Automatically stops after ten iterations','Creates a worker for each iteration'],'The nextTick queue is drained before the event loop proceeds; recursively refilling it can starve other work.'],
 ["Async Context Propagation",'const storage = new AsyncLocalStorage();\nstorage.run({requestId: "abc"}, () => {\n  setTimeout(() => console.log(storage.getStore().requestId), 0);\n});','Normally prints abc within this propagated asynchronous context',['Always undefined after run returns','Sets one process-global request ID forever','Requires copying the store into every timer manually'],'AsyncLocalStorage propagates a store through supported asynchronous operations created in the context.'],
 ["Transferred ArrayBuffer Ownership",'worker.postMessage(buffer, [buffer]);\n// buffer is an ordinary transferable ArrayBuffer.','The sender’s buffer becomes detached after transfer',['Both threads retain independent writable copies automatically','The buffer becomes a SharedArrayBuffer','Only the receiver loses access'],'Transfer moves ownership of the backing memory. SharedArrayBuffer has different sharing semantics.'],
 ["Avoid Shell Interpretation of Arguments",'// User supplies a filename.\nexec("cat " + filename);','Use a fixed executable with an argument array via execFile or spawn, with validation',['Escape spaces only','Pass the command through eval first','Convert the filename to uppercase'],'Shell interpolation lets data become shell syntax. Argument arrays avoid that parsing step; option handling and path access still need deliberate design.']
]);
pack('HTML',1,[
 ["Create a Hyperlink",'<a ____="/about">About</a>','href',null,'href gives an anchor its link destination.'],
 ["Provide an Image Description",'<img src="chart.png" ____="Sales rose in June">','alt',null,'alt provides a text alternative appropriate to the image’s purpose. Decorative images generally use empty alt.'],
 ["Declare the Page Language",'<html ____="en">','lang',null,'lang identifies the document language for browsers and assistive technology.'],
 ["Use a Native Button",'<____ type="button">Save</____>','button',null,'The native button element supplies built-in interaction semantics and keyboard support.'],
 ["Connect a Label to an Input",'<label for="email">Email</label>\n<input ____="email" type="email">','id',null,'A label’s for value refers to the associated control’s id.']
]);
pack('HTML',2,[
 ["A Button’S Default Form Behavior",'<form><button>Next</button></form>','The button defaults to submitting its form',['Always does nothing','Always resets the form','Defaults to type=link'],'Specify type="button" for an action that should not submit the form.'],
 ["Name a Submitted Field",'<input id="email" ____="email" type="email">','name',null,'name supplies the field name used in form submission; id alone does not do that.'],
 ["Group Related Controls",'<____>\n  <legend>Contact preferences</legend>\n  <!-- related inputs -->\n</____>','fieldset',null,'fieldset groups related controls and legend provides the group’s caption.'],
 ['Declare UTF-8','<meta ____="utf-8">','charset',null,'An early meta charset declaration supplies the character encoding when applicable.'],
 ["Mark the Main Content",'<____><h1>Dashboard</h1></____>','main',null,'main identifies the body’s dominant content. Avoid multiple visible main landmarks for a single page view.']
]);
pack('HTML',3,[
 ["Boolean Attributes Use Presence",'<input type="checkbox" checked="false">','The checked attribute is present, so the initial checked state is true',['The checkbox starts unchecked','The attribute is invalid and ignored','It creates a text input'],'A boolean HTML attribute is true by presence; the string false does not negate it.'],
 ["Disabled Fields and Submission",'<input name="code" value="123" disabled>','This disabled control is omitted from normal form data',['Submits the string disabled','Submits 123 normally','Disables all controls in the document'],'Disabled controls are not successful submitted controls. readonly has different behavior for supported input types.'],
 ["Defer a Classic External Script",'<script ____ src="app.js"></script>','defer',null,'defer delays a classic external script until parsing finishes and preserves order among such deferred scripts.'],
 ["Declare a Table Header",'<table><tr><____ scope="col">Name</____></tr></table>','th',null,'th identifies a header cell; scope="col" associates it with its column.'],
 ["Escape a Literal Less-Than Sign",'<p>Use ____ to show a literal &lt; in text.</p>','&lt;',null,'The &lt; character reference represents a less-than sign without opening a tag.']
]);
pack('HTML',4,[
 ["Async Scripts Can Reorder Execution",'<script async src="first.js"></script>\n<script async src="second.js"></script>','Execution order is not guaranteed by document order',['first always runs first','Both wait for DOMContentLoaded','async disables fetching'],'Async classic scripts run when available, so dependent scripts should not rely on their listed order.'],
 ["A Native Required Field Is Not Server Validation",'<input name="age" type="number" required>','Browser validation helps users but the server must still validate input',['The server receives only trustworthy numbers','required encrypts the value','A client cannot bypass required'],'Clients can bypass or forge requests. Server-side validation is required for trusted processing.'],
 ["Form Ownership Can Be Explicit",'<form id="settings"></form>\n<input form="settings" name="theme" value="dark">','The input belongs to settings despite being outside it',['The input has no form owner','form must contain a URL','Only nested controls can belong to a form'],'The form attribute associates supported controls with a form by id.'],
 ["Details Exposes a Built-in Disclosure",'<details><summary>More</summary><p>Extra information</p></details>','Creates a native disclosure with a summary control',['Creates a modal dialog','Always hides the summary','Requires JavaScript to toggle in a supported browser'],'details and summary provide built-in disclosure semantics and interaction.'],
 ["Specify an Accessible Icon-Button Name",'<button type="button" ____="Close">×</button>','aria-label',null,'aria-label supplies an accessible name where the symbol alone does not clearly express the action. Prefer visible meaningful text where suitable.']
]);
pack('HTML',5,[
 ["Integrity Does Not Authorize Every Future Script",'<script src="https://cdn.example/app.js"\n  integrity="sha384-..." crossorigin="anonymous"></script>','A valid SRI digest checks this fetched resource’s bytes; it is not a sandbox',['The digest grants unrestricted trust to all future scripts','SRI prevents every XSS vulnerability','crossorigin automatically encrypts script content'],'SRI compares a fetched resource with an expected digest. Cross-origin fetching must meet the appropriate CORS requirements.'],
 ["Sandbox Token Interaction",'<iframe sandbox="allow-scripts allow-same-origin" src="/child.html"></iframe>','For same-origin content, this combination can undermine the intended sandbox boundary',['Always blocks all scripts','Always forces a unique opaque origin','Guarantees full isolation from the parent'],'Same-origin scripted content can potentially remove the sandbox attribute and reload. Choose permissions and origins deliberately.'],
 ["Hidden Content and Accessibility",'<div hidden>Important instructions</div>','Normally not rendered and not available as ordinary accessible content',['Visually hidden but always read as normal page content','Automatically shown on keyboard focus','The hidden attribute changes the text to a tooltip'],'hidden marks content as not currently relevant; it is not a general screen-reader-only styling technique.'],
 ["Nested Forms Are Invalid HTML",'<form id="outer"><form id="inner">...</form></form>','Invalid nesting; the HTML parser can ignore or rearrange the intended form structure',['Creates two independent nested form owners as written','The inner form always inherits the outer action safely','Nested forms are required for file upload'],'Do not depend on source indentation to predict invalid markup recovery. Use separate forms or explicit form associations.'],
 ["Order of Deferred Scripts and DOMContentLoaded",'<script defer src="app.js"></script>\n<!-- classic external script, successfully fetched -->','DOMContentLoaded waits for deferred scripts to execute',['DOMContentLoaded always fires before every deferred script','defer scripts execute before parsing begins','DOMContentLoaded waits for every image'],'Deferred classic scripts run after parsing and before DOMContentLoaded; images have different loading behavior.']
]);
pack('KQL',1,[
 ["Filter Rows",'Events | ____ Level == "Error"','where',null,'where retains rows whose predicate evaluates to true.'],
 ["Choose Output Columns",'Events | ____ Timestamp, Message','project',null,'project selects and can rename or compute output columns.'],
 ["Limit Rows Without Promising Order",'Events | take 5','Returns at most five rows without a guaranteed choice or order',['Always returns the newest five','Always returns the oldest five','Returns every fifth row'],'take does not supply an ordering guarantee. Sort explicitly when order matters.'],
 ["Add a Computed Column",'Events | ____ Twice = Value * 2','extend',null,'extend appends or updates calculated columns without grouping rows.'],
 ["Sort Newest First",'Events | sort by Timestamp ____','desc',null,'desc requests descending order by the timestamp.']
]);
pack('KQL',2,[
 ["Count Events per Level",'Events | ____ Total = count() by Level','summarize',null,'summarize aggregates rows, producing one row per grouping key.'],
 ["Filter a Recent Time Window",'Events | where Timestamp >= ____(1h)','ago',null,'ago subtracts the timespan from the current UTC time used by the query.'],
 ["Bucket Timestamps",'Events | summarize count() by ____(Timestamp, 5m)','bin',null,'bin rounds the timestamp down to a five-minute boundary for grouping.'],
 ["Search for a Term Rather Than a Substring",'Events | where Message has "error"','Matches a case-insensitive term rather than any arbitrary substring',['Matches only the entire column exactly','Equivalent to contains for all strings','Is case-sensitive by default'],'has uses term semantics; contains searches for substrings, and case-sensitive variants are available.'],
 ["Convert Text to an Integer",'print n = toint("42")','n is 42',['n is the string "42"','n is 0','Always errors'],'toint parses an integer; failed conversions can return null.']
]);
pack('KQL',3,[
 ["Get the Latest Row per Host",'Events | summarize ____(Timestamp, *) by Host','arg_max',null,'arg_max returns the requested columns from a row with the maximum timestamp within each host group. Ties need deliberate handling.'],
 ["Parse a JSON String",'Events | extend payload = ____(RawJson)','parse_json',null,'parse_json converts valid JSON text to a dynamic value for subsequent property access.'],
 ["Expand Array Elements",'datatable(xs:dynamic)[dynamic([1,2])]\n| mv-expand xs','Produces two rows with the array’s elements',['Produces one row with the sum','Always returns strings only','Filters the row out'],'mv-expand creates rows from elements in dynamic arrays or bags.'],
 ["Name a Query Expression",'____ recent = Events | where Timestamp > ago(1h);\nrecent | count','let',null,'let binds a name to an expression for reuse. It does not necessarily cache its evaluated result.'],
 ["Keep Unmatched Left Rows",'Hosts | join kind=____ (Alerts) on Host','leftouter',null,'leftouter keeps left rows even when no right-side row matches. Matched rows can multiply according to key cardinality.']
]);
pack('KQL',4,[
 ["The Default Join Can Deduplicate the Left Input",'Left | join (Right) on Key','Defaults to innerunique, which deduplicates left keys before matching',['Always defaults to fullouter','Always preserves every left duplicate','Defaults to a cartesian product'],'Kusto’s default join flavor is innerunique. Specify inner when matching all duplicate left rows is intended.'],
 ["Empty Aggregate Input Without Grouping",'datatable(x:long)[] | summarize n=count()','Returns one row with n = 0',['Returns no rows','Returns one row with n = null','Throws an empty-table error'],'Without a grouping key, summarize returns an aggregate row; count defaults to zero for empty input.'],
 ["Empty Strings Are Not Scalar null Strings",'print missing = isempty("")','missing is true',['missing is false','missing is null','An empty string is always rejected'],'Kusto string values do not support scalar null in the same way numeric types do. isempty tests empty text.'],
 ["A Filter Removes null Predicates",'datatable(x:long)[long(null), 1] | where x > 0','Retains only the row with x = 1',['Retains both rows','Retains only the null row','Throws because x contains null'],'where retains true predicates; a null boolean result is not retained.'],
 ["Project Away Large Payloads Before a Join",'Events | project Host, Timestamp\n| join kind=inner (Hosts | project Host, Region) on Host','Can reduce join data volume when omitted columns are not needed',['Always changes inner to leftouter','Creates indexes on both tables','Guarantees the join runs in constant time'],'Early projection reduces carried columns; early selective filtering can also reduce work. Measure with the actual data.']
]);
pack('KQL',5,[
 ["Materialize a Reused Tabular Expression",'let recent = ____(Events | where Timestamp > ago(1h));\nrecent | count','materialize',null,'materialize captures a tabular expression for reuse during the query. Its cache is bounded, so reduce data before materializing and measure the effect.'],
 ["A let Binding Is Not Automatically a Cache",'let sample = Events | sample 1;\n// Two separate references to sample follow.','The expression can be reevaluated, producing different sampled rows',['Every let tabular value is cached automatically','sample always returns the first row','let permanently writes a new database table'],'let binds a calculation. Use materialize when a shared evaluated tabular result is required.'],
 ["High-Cardinality Grouping and Shuffle",'Events | summarize hint.strategy=shuffle count() by RequestId','A distributed shuffle can help high-cardinality grouping; evaluate it for the actual workload',['Always runs on a single node','Changes count into an approximate count','Guarantees faster results for every query'],'Shuffle partitions work by keys. Performance depends on workload, key cardinality, and the rest of the query plan.'],
 ["Result Truncation Is Not a Completeness Guarantee",'// A client retrieves a very large Kusto result.\n// The service reports a result-size or record-count truncation failure.','Do not treat the partial result as complete; redesign retrieval or aggregation',['The server always silently returns every row','take guarantees a complete dataset','A partial result is automatically a random representative sample'],'Large result retrieval has service limits. Aggregate server-side or use a supported export/retrieval strategy rather than assuming completeness.'],
 ["arg_max Ties Are Not a Total Order",'datatable(Host:string, Timestamp:datetime, Value:long)\n["a", datetime(2026-01-01), 1, "a", datetime(2026-01-01), 2]\n| summarize arg_max(Timestamp, *) by Host','The tie does not specify which Value row is chosen',['Always chooses Value 1','Always chooses Value 2','Returns both rows automatically'],'A maximum timestamp alone does not break equal-timestamp ties. Define a deliberate tie-breaking strategy when deterministic selection matters.']
]);
pack('Swift',1,[
 ["Declare a Mutable Binding",'____ count = 0\ncount += 1','var',null,'var declares a mutable binding; let declares a constant binding.'],
 ["Declare an Optional Integer",'var score: Int____ = nil','?',null,'Int? is an optional Int that can hold a value or nil.'],
 ["Count Array Elements",'let values = [1, 2, 3]\nprint(values.count)','3',['2','4','nil'],'count returns the number of elements, not the last index.'],
 ["Interpolate a Value",'let n = 3\nprint("Count: \\(n)")','Count: 3',['Count: n','Count: \\(n)','Compilation error'],'Swift string interpolation evaluates the expression inside backslash-parentheses.'],
 ["An Exclusive Range",'print(Array(0..<3))','[0, 1, 2]',['[0, 1, 2, 3]','[1, 2, 3]','[0, 3]'],'..< excludes its upper bound; ... includes both endpoints.']
]);
pack('Swift',2,[
 ["Optional Binding",'let value: Int? = 4\nif ____ n = value { print(n) }','let',null,'if let unwraps the optional into a non-optional binding inside the branch.'],
 ["Fallback for Nil",'let value: Int? = nil\nprint(value ?? 7)','7',['nil','0','Runtime trap'],'The nil-coalescing operator supplies the fallback only if the optional is nil.'],
 ["Define a Function Return Type",'func square(_ n: Int) ____ Int { n * n }','->',null,'The arrow introduces the function’s return type. A single-expression function can return implicitly.'],
 ["Append to an Array",'var items = [1, 2]\nitems.____(3)','append',null,'append adds an element to the end of a mutable array.'],
 ["Array Value Semantics",'var a = [1, 2]\nvar b = a\nb[0] = 9\nprint(a[0])','1',['9','0','Compilation error'],'Swift arrays have value semantics; their copy-on-write implementation preserves independent observable values.']
]);
pack('Swift',3,[
 ["Exit When Optional Binding Fails",'func show(_ value: Int?) {\n  ____ let n = value else { return }\n  print(n)\n}','guard',null,'guard requires its else branch to exit the current scope; successful bindings remain available afterward.'],
 ["Handle a Throwing Operation",'do {\n  let result = ____ load()\n  print(result)\n} catch { print(error) }\n// load is a throwing function.','try',null,'try marks a throwing call, while do-catch handles its thrown error.'],
 ["Class Instances Have Reference Semantics",'class Box { var n = 1 }\nlet a = Box()\nlet b = a\nb.n = 9\nprint(a.n)','9',['1','0','Compilation error'],'Both constants refer to the same mutable object. A constant reference does not freeze all properties of its referent.'],
 ["Map a Collection",'print([1, 2, 3].map { $0 * 2 })','[2, 4, 6]',['[1, 2, 3]','[6]','[2, 3, 4]'],'map transforms each element and returns the results.'],
 ["Defer Cleanup",'func f() {\n  defer { print("cleanup") }\n  print("work")\n}\nf()','work, cleanup',['cleanup, work','work only','cleanup only'],'defer runs when execution leaves the scope, including many error exits.']
]);
pack('Swift',4,[
 ["Break a Closure Retain Cycle",'// An object owns a stored closure that captures the object strongly.\n// What is a common appropriate capture strategy when the object may disappear?','Capture self weakly and handle its optional value',['Capture self strongly twice','Make every property static','ARC automatically detects all cycles'],'A weak capture avoids one strong ownership edge. Decide lifetime behavior deliberately rather than applying weak universally.'],
 ["Weak References Can Become Nil",'weak var owner: Owner?\n// All strong references to the Owner instance are released.','owner becomes nil when the instance is deallocated',['owner keeps the instance alive','owner becomes an unowned dangling pointer','The instance becomes immortal'],'Weak references do not retain their referents and are cleared when they are deallocated.'],
 ["An unowned Reference Needs a Lifetime Guarantee",'unowned let owner: Owner\n// Code accesses owner after its object was deallocated.','Access can trap; unowned does not keep the object alive',['Always returns nil','Automatically recreates Owner','Is equivalent to a strong reference'],'Use unowned only with a valid lifetime relationship. Weak is appropriate when the referent may cease to exist independently.'],
 ["Await an Asynchronous Result",'let value = ____ fetchValue()\n// fetchValue is async and nonthrowing.','await',null,'await marks a potential suspension point at an async call. It does not imply a new thread per call.'],
 ["A Mutating Struct Method",'struct Counter {\n  var n = 0\n  ____ func bump() { n += 1 }\n}','mutating',null,'A struct method that changes its value needs the mutating modifier.']
]);
pack('Swift',5,[
 ["Actors Can Be Reentrant Across await",'actor Store {\n  var count = 0\n  func update() async {\n    let old = count\n    await pause()\n    count = old + 1\n  }\n}','Other actor work can change count during suspension, so old may be stale',['The actor locks its entire method across await','Actors forbid every await inside a method','count can only change after the process ends'],'Actor isolation prevents concurrent unsynchronized access, but suspension permits interleaving. Recheck invariants after await.'],
 ["Sendable Is a Safety Contract",'// A mutable reference type is transferred across concurrency domains.\n// Why is merely adding @unchecked Sendable insufficient by itself?','It asserts programmer responsibility; synchronization still must be correct',['It automatically wraps every property in a mutex','It disables all mutation at runtime','It copies every instance deeply'],'Unchecked conformance bypasses compiler checking and requires a sound manual safety argument.'],
 ["Task Cancellation Is Cooperative",'task.cancel()\n// The task runs a long CPU loop without checking cancellation.','Cancellation does not forcibly terminate the loop',['The OS kills the executing thread immediately','The loop is rewound','Cancellation always throws without a check'],'Tasks must cooperate through cancellation checks or APIs that honor cancellation.'],
 ["Multiple defer Blocks Run in Reverse Order",'func f() {\n  defer { print(1) }\n  defer { print(2) }\n}\nf()','2, 1',['1, 2','Only 1','Only 2'],'Deferred actions execute in reverse order of registration when their scope exits.'],
 ["Exclusivity of inout Access",'func modify(_ a: inout Int, _ b: inout Int) {\n  a += 1; b += 1\n}\nvar x = 0\nmodify(&x, &x)','Overlapping inout accesses violate exclusivity',['Safely increments x twice in every context','Creates two independent copies permanently','inout arguments are read-only'],'Swift requires exclusive mutable access during overlapping inout accesses; this directly evident conflict is rejected.']
]);
pack('Kotlin',1,[
 ["Declare a Mutable Variable",'____ count = 0\ncount += 1','var',null,'var permits reassignment; val makes the binding read-only.'],
 ["A Nullable Type",'val name: String____ = null','?',null,'String? permits null; String does not.'],
 ["Read a List Size",'println(listOf(1, 2, 3).size)','3',['2','4','null'],'size gives the number of list elements.'],
 ["String Templates",'val n = 3\nprintln("Count: $n")','Count: 3',['Count: $n','Count: n','Compilation error'],'A dollar-prefixed identifier interpolates its value in a Kotlin string.'],
 ["Inclusive Integer Ranges",'println((1..3).toList())','[1, 2, 3]',['[1, 2]','[0, 1, 2]','[1, 3]'],'.. creates an inclusive range.']
]);
pack('Kotlin',2,[
 ["Safe-Call Operator",'val name: String? = null\nprintln(name?.length)','null',['0','NullPointerException','Compilation error'],'?. returns null rather than accessing a member when the receiver is null.'],
 ["Elvis Fallback",'val name: String? = null\nprintln(name ____ "guest")','?:',null,'The Elvis operator chooses its right-hand expression if the left value is null.'],
 ["Define a Function Result",'fun square(n: Int) ____ Int = n * n',':',null,'A colon introduces the return type in a Kotlin function declaration.'],
 ["Read-Only List Interface",'val xs = listOf(1, 2)\n// Can xs.add(3) be called through this inferred List type?','No; List exposes a read-only interface',['Yes because val freezes only the reference','Yes if the element is an Int','It always throws at this call after compiling normally'],'MutableList exposes mutation operations. A read-only interface alone is not a deep immutability guarantee.'],
 ["Map Elements",'println(listOf(1, 2).map { it * 2 })','[2, 4]',['[1, 2]','[3]','[2, 3]'],'map applies the transformation and collects each result.']
]);
pack('Kotlin',3,[
 ["Smart Cast After a Type Test",'fun size(x: Any): Int =\n  if (x is String) x.length else 0','x is smart-cast to String in the true branch',['A manual unsafe cast is always required','x.length reads an Any member','The code is always invalid'],'A stable value can be smart-cast after a successful type check.'],
 ["Data-Class Structural Equality",'data class Point(val x: Int)\nprintln(Point(1) == Point(1))','true',['false','Compilation error','null'],'A data class generates equals based on its primary-constructor properties.'],
 ["Non-Null Assertion Can Fail",'val name: String? = null\nprintln(name!!.length)','Throws a NullPointerException',['Prints zero','Prints null','Makes a new empty string'],'!! asserts non-nullness and throws if the value is null. Prefer safe handling where absence is legitimate.'],
 ["When Can Be an Expression",'val n = 2\nval label = when (n) {\n  1 -> "one"\n  else -> "other"\n}\nprintln(label)','other',['one','2','Compilation error'],'when selects a branch and produces its value in expression form.'],
 ["Destructure a Pair",'val (name, score) = "Ada" to 9\nprintln(score)','9',['Ada','null','Compilation error'],'Destructuring calls component functions; Pair provides component1 and component2.']
]);
pack('Kotlin',4,[
 ["Data-Class Copy Is Shallow",'data class Box(val xs: MutableList<Int>)\nval a = Box(mutableListOf(1))\nval b = a.copy()\nb.xs.add(2)\nprintln(a.xs)','[1, 2]',['[1]','[2]','Compilation error'],'copy reuses property references by default; it does not deeply clone nested mutable objects.'],
 ["Sequences defer Transformations",'val result = listOf(1, 2).asSequence().map { it * 2 }','The map work happens when the sequence is consumed',['map always eagerly allocates a new List','The original list is changed','Creates a new OS thread'],'Sequence intermediate operations are lazy; terminal operations drive traversal.'],
 ["Suspend Is Not a Dispatcher Choice",'suspend fun compute() { heavyCpuLoop() }','suspend alone does not move CPU work to a background dispatcher',['Always creates a background thread','Makes all synchronous code nonblocking','Automatically yields during every loop iteration'],'A suspending function can still block its executing thread. Choose an appropriate dispatcher and cooperative behavior.'],
 ["Launch Versus async Result",'val result = async { 42 }\nprintln(result.____())','await',null,'async returns a Deferred result, obtained using await; launch returns a Job rather than a value result.'],
 ["A Val Can Refer to Mutable State",'val xs = mutableListOf(1)\nxs.add(2)\nprintln(xs)','[1, 2]',['Compilation error because val forbids all mutation','[1]','[2]'],'val prevents rebinding xs; it does not make the referenced collection immutable.']
]);
pack('Kotlin',5,[
 ["Cooperative Coroutine Cancellation",'while (true) {\n  cpuWork()\n}\n// cpuWork does not suspend or check cancellation.','The loop can keep running after cancellation is requested',['Cancellation forcibly kills the thread','Every loop iteration suspends implicitly','No coroutine can run CPU work'],'CPU loops should check isActive or ensureActive or otherwise cooperate with cancellation.'],
 ["Structured Sibling Failure",'coroutineScope {\n  launch { throw IllegalStateException() }\n  launch { delay(Long.MAX_VALUE) }\n}','The scope fails and cancels the sibling',['The scope always ignores launch failures','Only the failed child is affected in every scope','The sibling is made immortal'],'A normal coroutineScope propagates child failure and cancels other children; supervision changes that relationship.'],
 ["SupervisorJob Changes Failure Propagation",'// Two child coroutines have the same SupervisorJob parent.\n// One fails with a non-cancellation exception.','The sibling is not cancelled solely because this child failed',['Every sibling must be cancelled','The failed child is always retried automatically','All failures disappear without handling'],'Supervision isolates child failure, but error handling and parent cancellation still matter.'],
 ["Rethrow Cancellation Exceptions",'try { cancellableWork() }\ncatch (e: Exception) { log(e) }','This can swallow cancellation; rethrow CancellationException when handling broadly',['Always preserves cancellation automatically','Exception can never include cancellation','Only Error catches cancellation'],'CancellationException participates in exception handling. Swallowing it can disrupt cooperative cancellation semantics.'],
 ["Generic Variance for a Producer",'interface Source<____ T> {\n  fun get(): T\n}','out',null,'out declares covariance for a type used in output positions, allowing a Source<Subtype> where Source<Supertype> is expected.']
]);
pack('Go',1,[
 ["Short Variable Declaration",'count ____ 0',':=',null,'Inside a function, := declares and initializes at least one new non-blank variable.'],
 ["Read a Slice Length",'values := []int{1, 2, 3}\nfmt.Println(____(values))','len',null,'len gives the number of slice elements; cap describes capacity.'],
 ["Define a Function Return Type",'func square(n int) ____ { return n * n }','int',null,'Go places the result type after the parameter list.'],
 ["Declare an Integer Zero Value",'var n int\nfmt.Println(n)','0',['nil','Uninitialized random data','Compilation error'],'An int variable’s zero value is 0.'],
 ["Append an Element",'xs := []int{1, 2}\nxs = ____(xs, 3)','append',null,'append returns the updated slice header and may allocate a new backing array.']
]);
pack('Go',2,[
 ["Check an Error Explicitly",'value, err := readValue()\nif err ____ nil { return err }\n_ = value','!=',null,'The conventional error check compares the returned error with nil.'],
 ["Loop Over a Slice",'for index, value := ____ []int{4, 5} {\n  fmt.Println(index, value)\n}','range',null,'range over a slice provides the index and a copy of the element value.'],
 ["A Missing Map Key Gives a Zero Value",'m := map[string]int{}\nfmt.Println(m["missing"])','0',['nil','Panic','Compilation error'],'A missing key produces the element type’s zero value. Use the comma-ok form to distinguish absence.'],
 ["Deferred Calls Run on Function Exit",'func f() {\n  defer fmt.Println("cleanup")\n  fmt.Println("work")\n}\nf()','work, cleanup',['cleanup, work','work only','cleanup only'],'defer schedules a function call for when the enclosing function returns.'],
 ["Start a Goroutine",'____ work()','go',null,'go starts the function call in a goroutine. It does not wait for it to complete.']
]);
pack('Go',3,[
 ["Detect a Missing Map Key",'value, ____ := m["key"]\n// This boolean distinguishes absence from a present zero value.','ok',null,'The second map lookup result reports whether the key is present. The identifier ok is conventional.'],
 ["Slices Can Share Backing Storage",'a := []int{1, 2, 3}\nb := a[:2]\nb[0] = 9\nfmt.Println(a[0])','9',['1','0','Panic'],'Slicing normally creates another view into the same backing array.'],
 ["A Buffered Channel Stores a Pending Value",'ch := make(chan int, 1)\nch <- 7\nfmt.Println(<-ch)','7',['Deadlock at the send','0','Compilation error'],'The one-slot buffer accepts one send before a receive is ready.'],
 ["Defer Evaluates Arguments Immediately",'n := 1\ndefer fmt.Println(n)\nn = 2\n// The function now returns.','Prints 1 during deferred execution',['Prints 2','Prints both 1 and 2','Prints nothing'],'The call arguments are evaluated when defer is executed, even though the call occurs later.'],
 ["Export Identifiers With Capitalization",'type Item struct { Name string; count int }','Name is exported; count is not',['Both fields are exported','Neither field is exported','Only fields with JSON tags are exported'],'Exported names start with an uppercase letter; tags do not independently change visibility.']
]);
pack('Go',4,[
 ["A Nil Map Cannot Accept Writes",'var m map[string]int\nm["x"] = 1','Panics: assignment to entry in nil map',['Automatically initializes m','Silently ignores the write','Compilation error'],'Reads from nil maps are allowed; allocate with make or a map literal before writing.'],
 ["Closing a Channel Does Not Erase Buffered Data",'ch := make(chan int, 1)\nch <- 7\nclose(ch)\na, ok1 := <-ch\nb, ok2 := <-ch','a=7, ok1=true; b=0, ok2=false',['Both reads return zero and false','Both reads panic','Closing blocks until the buffer is empty'],'Receives drain buffered values before returning the zero value with ok=false.'],
 ["Synchronize Concurrent Map Access",'// One goroutine writes to m while another reads m.\n// No locking or other synchronization is used.','Unsafe concurrent access; synchronize it or choose a suitable concurrent design',['Ordinary maps are automatically thread-safe','Readers always see a snapshot','Only string-keyed maps can race'],'Concurrent access with a write requires coordination; use a mutex, ownership via a channel, or an appropriate concurrent map.'],
 ["Recover Must Run in the Panicking Goroutine",'// Goroutine A panics.\n// Goroutine B has a deferred function that calls recover().','B cannot recover A’s panic',['Any goroutine can recover any panic','recover always catches every process panic','Panic is converted automatically to an error return'],'recover works under specific deferred-call rules in the goroutine whose stack is unwinding.'],
 ["Context Cancellation Is a Signal",'ctx, cancel := context.WithCancel(context.Background())\ncancel()','Closes ctx.Done(); work must observe cancellation appropriately',['Kills every goroutine using ctx forcibly','Deletes all context values','Waits for every goroutine to finish'],'Cancellation signals intent. It does not forcibly terminate code or wait for cleanup completion.']
]);
pack('Go',5,[
 ["An Interface With a Typed Nil Is Not Nil",'type E struct{}\nfunc (*E) Error() string { return "error" }\nvar p *E = nil\nvar err error = p\nfmt.Println(err == nil)','false',['true','Compilation error','Always panics at assignment'],'The interface has a dynamic type *E and a nil dynamic value, so the interface itself is non-nil.'],
 ["Fresh Range Variables in Modern Go",'// Go 1.22+ language semantics:\nfor _, value := range []int{1, 2, 3} {\n  callbacks = append(callbacks, func() int { return value })\n}\n// Invoke callbacks afterward in order.','They return 1, 2, 3',['They must all return 3','They must all return 0','Closures cannot capture range variables'],'Variables declared by the range clause get per-iteration bindings under these language semantics. Older Go behavior differed.'],
 ["Nil Channels Disable Select Cases",'var ch chan int\nselect {\ncase <-ch: fmt.Println("value")\ndefault: fmt.Println("default")\n}','Prints default',['Prints value','Panics because ch is nil','Always deadlocks'],'Communication on a nil channel cannot proceed, so that case is disabled; default is ready when no communication case is.'],
 ["Protect a Shared Counter",'// Several goroutines execute count++ on one int without synchronization.','A data race; use suitable locking or atomic operations',['Guaranteed correct because ints fit in a word','Safe if each goroutine increments only once','The compiler adds a mutex'],'Increment is a read-modify-write operation, and unsynchronized conflicting access violates the memory model.'],
 ["Limit Capacity to Force Append Allocation",'a := []int{1, 2, 3}\nb := a[:1:1]\nb = append(b, 9)\nfmt.Println(a[1])','2',['9','1','Panic'],'The full slice expression limits b’s capacity to one, so append must allocate new backing storage here.']
]);
pack('R',1,[
 ["Assign a Value",'score ____ 3','<-',null,'<- is the conventional assignment operator in R.'],
 ["Combine Values Into a Vector",'values <- ____(1, 2, 3)','c',null,'c combines its arguments into a vector, coercing elements to a common type when needed.'],
 ["R Indexing Starts at One",'x <- c(10, 20, 30)\nx[1]','10',['20','0','30'],'Positive element indices are one-based in R.'],
 ["Measure a Vector",'____(c(4, 5, 6))','length',null,'length returns the number of vector elements.'],
 ["Create an Inclusive Sequence",'1:3','c(1, 2, 3)',['c(1, 2)','c(0, 1, 2)','c(1, 3)'],'The colon operator creates the integer-spaced sequence including these endpoints.']
]);
pack('R',2,[
 ["Vectorized Arithmetic",'c(1, 2, 3) * 2','c(2, 4, 6)',['c(1, 2, 3, 2)','6','An error'],'Multiplication operates elementwise; the scalar is recycled across the vector.'],
 ["Check Missing Values",'____(c(1, NA))','is.na',null,'is.na returns a logical vector identifying missing values. Comparing with NA does not test missingness correctly.'],
 ["Remove Missing Values in a Mean",'mean(c(1, NA, 3), ____ = TRUE)','na.rm',null,'na.rm asks mean to omit missing values before computing the result.'],
 ["Define a Function",'square <- ____(x) { x * x }','function',null,'function creates a function object with parameters and a body.'],
 ["Filter by a Logical Vector",'x <- c(1, 3, 2)\nx[x > 1]','c(3, 2)',['c(1)','c(TRUE, TRUE)','c(1, 3, 2)'],'Logical indexing selects elements where the index value is TRUE.']
]);
pack('R',3,[
 ["Extract a List Element Versus a Sublist",'x <- list(a = 1, b = 2)\nx[1]','A one-element list',['The numeric scalar 1','The name string a','An error'],'Single brackets preserve a sublist; double brackets extract an element.'],
 ["Recycling Can Warn",'c(1, 2, 3) + c(10, 20)','c(11, 22, 13), with a length-recycling warning',['c(11, 22) without warning','An immediate error with no result','c(11, 12, 13)'],'The shorter vector is recycled, and non-multiple lengths trigger a warning in this arithmetic.'],
 ["Common Atomic Vector Type",'typeof(c(1, "two"))','character',['double','list','integer'],'Combining numeric and character elements into an atomic vector coerces them to character.'],
 ["A Data-Frame Column",'df <- data.frame(score = c(1, 2))\ndf$score','A numeric vector c(1, 2)',['A two-column data frame','A function','The string score'],'$ accesses the named column; data frames are list-like collections of columns.'],
 ["Lexical Lookup Uses the Enclosing Environment",'x <- 1\nf <- function() x\nx <- 2\nf()','2',['1','NULL','An error'],'f looks up x in its enclosing environment when evaluated; the global binding has changed to 2.']
]);
pack('R',4,[
 ["Missing Logical Indices Select Missing Results",'x <- c(1, NA, 3)\nx[x > 1]','c(NA, 3)',['c(3)','c(1, 3)','An error'],'The comparison returns NA for the missing element, and a logical NA index produces a missing result.'],
 ["Preserve Matrix Dimensions",'m <- matrix(1:4, nrow = 2)\nm[, 1, ____ = FALSE]','drop',null,'drop=FALSE prevents dimension dropping for a one-column subset.'],
 ["Zero-Length Loops Need seq_along",'x <- numeric(0)\n1:length(x)','c(1, 0), not an empty sequence',['integer(0)','An error','Only 0'],'1:0 is a decreasing sequence. Use seq_along(x) or seq_len(length(x)) for zero-length safety.'],
 ["NA Comparisons Stay Unknown",'NA == NA','NA',['TRUE','FALSE','NULL'],'Equality with NA produces a missing logical result. Use is.na to test missingness.'],
 ["Factor Numeric Conversion",'x <- factor(c("10", "20"))\nas.numeric(x)','The internal level codes, here c(1, 2)',['The numeric labels c(10, 20)','Always c(0, 0)','An error'],'Numeric coercion of a factor gives its codes. Convert the labels appropriately if numeric label values are desired.']
]);
pack('R',5,[
 ["Promises Evaluate Lazily and Are Cached",'f <- function(x) { x; x }\nf({ cat("once"); 3 })','Prints once a single time',['Prints once twice','Never evaluates the argument','Always errors'],'The argument is a promise. Its first evaluation forces and caches the value for subsequent uses.'],
 ["Environment Objects Have Reference Semantics",'a <- new.env()\na$x <- 1\nb <- a\nb$x <- 9\na$x','9',['1','NULL','An error'],'Environment assignment shares the environment object; mutation through either name affects it.'],
 ["Make a Closure’S Captured Argument Stable",'make <- function(x) {\n  ____(x)\n  function() x\n}','force',null,'force evaluates the argument promise when creating the closure, avoiding unintended later evaluation against changed external bindings.'],
 ["Superassignment Searches Enclosing Environments",'x <- 0\nf <- function() { x <<- 1 }\nf()\nx','1',['0','NULL','Always an error'],'<<- searches enclosing environments for an existing binding and can assign globally if needed. Use carefully to avoid hidden state changes.'],
 ["Typed vapply Results Are Checked",'vapply(list(1, 2), function(x) "text", numeric(1))','Errors because the returned type is incompatible with the numeric template',['Silently coerces text to zero','Returns an unrestricted list','Always returns a character vector'],'vapply checks the expected length and type, with only permitted coercions, rather than accepting arbitrary results.']
]);

const EXTRA_REFS = {
  'pack-node.js-3-1':'https://nodejs.org/api/stream.html',
  'pack-node.js-3-2':'https://nodejs.org/api/stream.html',
  'pack-node.js-4-1':'https://nodejs.org/api/events.html#error-events',
  'pack-node.js-4-2':'https://nodejs.org/api/worker_threads.html',
  'pack-node.js-5-1':'https://nodejs.org/api/process.html#processnexttickcallback-args',
  'pack-node.js-5-2':'https://nodejs.org/api/process.html#processnexttickcallback-args',
  'pack-node.js-5-3':'https://nodejs.org/api/async_context.html',
  'pack-node.js-5-4':'https://nodejs.org/api/worker_threads.html',
  'pack-node.js-5-5':'https://nodejs.org/api/child_process.html',
  'pack-kql-4-1':'https://learn.microsoft.com/en-us/kusto/query/join-innerunique',
  'pack-kql-4-2':'https://learn.microsoft.com/en-us/kusto/query/summarize-operator',
  'pack-kql-4-3':'https://learn.microsoft.com/en-us/kusto/query/scalar-data-types/null-values',
  'pack-kql-5-1':'https://learn.microsoft.com/en-us/kusto/query/materialize-function',
  'pack-kql-5-2':'https://learn.microsoft.com/en-us/kusto/query/let-statement',
  'pack-kql-5-4':'https://learn.microsoft.com/en-us/kusto/concepts/query-limits',
  'pack-swift-4-1':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/',
  'pack-swift-4-2':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/',
  'pack-swift-4-3':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/',
  'pack-swift-5-1':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/',
  'pack-swift-5-2':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/',
  'pack-swift-5-3':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/',
  'pack-swift-5-5':'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/memorysafety/',
  'pack-kotlin-5-1':'https://kotlinlang.org/docs/cancellation-and-timeouts.html',
  'pack-kotlin-5-2':'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html',
  'pack-kotlin-5-3':'https://kotlinlang.org/docs/exception-handling.html',
  'pack-kotlin-5-4':'https://kotlinlang.org/docs/cancellation-and-timeouts.html',
  'pack-go-5-4':'https://go.dev/ref/mem'
};
for(const q of QUESTIONS) if(EXTRA_REFS[q.id]) q.source = EXTRA_REFS[q.id];
