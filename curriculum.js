// Each topic keeps its original four IDs, then adds 3/3/5/5/5 questions.
// Stable IDs preserve existing progress. Snippets are teaching fragments.
const REFERENCES = {
  JavaScript:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
  Python:'https://docs.python.org/3/reference/',
  C:'https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf',
  'C++':'https://eel.is/c++draft/',
  Rust:'https://doc.rust-lang.org/book/',
  Java:'https://docs.oracle.com/javase/specs/jls/se21/html/index.html',
  VHDL:'https://ghdl.github.io/ghdl/using/ImplementationOfVHDL.html',
  Bash:'https://www.gnu.org/software/bash/manual/bash.html',
  SQL:'https://www.postgresql.org/docs/current/sql.html',
  Assembly:'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
  Git:'https://git-scm.com/docs'
};
const CONTEXT = {C:'Assume C11, required headers, and execution inside a function unless a declaration is shown.', 'C++':'Assume C++20 and required standard headers.', Python:'Assume Python 3.11 or later.', SQL:'Assume PostgreSQL.', Assembly:'Assume x86-64 Intel syntax; ABI questions use System V AMD64.', VHDL:'Assume VHDL-2008, IEEE.std_logic_1164 and numeric_std, and appropriate enclosing declarations.'};
function pack(language, level, rows) {
  rows.forEach((row,index) => {
    const [title,code,answer,wrong,explanation,hint,extension] = row;
    const options = wrong ? [answer,...wrong] : undefined;
    // Rotate accepted-answer position; do not train users to choose the first option.
    if (options) for(let i=0;i<(level+index)%options.length;i++) options.push(options.shift());
    const id = `pack-${language.toLowerCase().replace(/\+/g,'p')}-${level}-${index+1}`;
    question(id,language,level,wrong ? 'Reason About Code' : 'Fill the Blank',title,
      `${wrong ? 'Choose the correct answer for this example.' : 'Replace ____ with the missing code.'} ${CONTEXT[language] || ''}`,
      code,[answer],hint || 'Trace the values and consider the rule this example relies on.',explanation,
      extension || 'Write a minimal example of this rule, then change one condition and predict the difference.',options);
    QUESTIONS[QUESTIONS.length-1].source = REFERENCES[language] || TOOL_DOCS[language];
  });
}
pack('JavaScript',1,[
 ["Which Declaration Allows Reassignment?",'____ score = 0;\nscore = 1;','let',null,'let permits reassignment. const prevents reassignment of the binding.','Think about binding mutability.'],
 ["What Is the Array Length?",'const a = ["x", "y", "z"];\nconsole.log(a.length);','3',['2','4','undefined'],'length is the number of positions here; the last index is 2.'],
 ["Compare Values Without Coercion",'console.log(0 === false);','false',['true','0','TypeError'],'Strict equality does not coerce different operand types.']
]);
pack('JavaScript',2,[
 ["Keep Zero as a Valid Value",'const count = 0;\nconsole.log(count ?? 10);','0',['10','null','undefined'],'?? substitutes only for null or undefined, preserving zero.','Compare nullish values with falsy values.'],
 ["Spread Makes a Shallow Copy",'const a = [{n: 1}];\nconst b = [...a];\nb[0].n = 8;\nconsole.log(a[0].n);','8',['1','undefined','TypeError'],'The array is copied but its element still references the same object.'],
 ["Sort Numbers Numerically",'const a = [10, 2, 1];\na.sort((x, y) => ____);','x - y',null,'A negative comparator result puts x before y. Default sort compares string representations.','Return the difference for ascending order.']
]);
pack('JavaScript',3,[
 ["Promise Reaction Order",'console.log("A");\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");','A, C, B',['A, B, C','B, A, C','C, B, A'],'The current synchronous code finishes before queued promise reactions run.'],
 ["Map an async Operation Safely",'const result = await ____([1, 2].map(async n => n * 2));','Promise.all',null,'Promise.all collects the resolved values in input order.','Wait for every mapped promise.'],
 ["Reduce With an Initial Value",'console.log([].reduce((a, b) => a + b, 0));','0',['undefined','NaN','TypeError'],'With no elements, reduce returns the supplied initial value.'],
 ["A Missing Property in Destructuring",'const {x = 4} = {x: null};\nconsole.log(x);','null',['4','undefined','TypeError'],'Destructuring defaults apply to undefined, not null.'],
 ["Object Keys Are Strings",'const o = {};\no[1] = "a";\no["1"] = "b";\nconsole.log(Object.keys(o).length);','1',['2','0','TypeError'],'Both expressions address the same string property key.']
]);
pack('JavaScript',4,[
 ["finally Replaces a Return",'function f() {\n  try { return 1; }\n  finally { return 2; }\n}\nconsole.log(f());','2',['1','undefined','SyntaxError'],'An explicit return in finally replaces the prior completion. Avoid returning from finally accidentally.'],
 ["Arrow Functions Capture This",'const make = function() { return () => this.x; };\nconst f = make.call({x: 7});\nconsole.log(f.call({x: 9}));','7',['9','undefined','TypeError'],'The arrow captures this from make; call cannot rebind the arrow’s this.'],
 ["A Rejected Input to Promise.all",'await Promise.all([Promise.reject("fail"), slowTask()]);','The aggregate rejects; slowTask is not automatically cancelled',['All work is cancelled','The aggregate waits for success','The rejection is ignored'],'Promise aggregation does not cancel other operations. Cancellation requires a separate design.'],
 ["Read a Binding in Its Temporal Dead Zone",'let x = 1;\n{ console.log(x); let x = 2; }','ReferenceError',['1','2','undefined'],'The inner lexical binding shadows x throughout the block and is uninitialized before its declaration.'],
 ["Delete an Array Element",'const a = [1, 2, 3];\ndelete a[1];\nconsole.log(a.length);','3',['2','1','0'],'delete creates a hole without shortening the array. splice can remove and shift an element.']
]);
pack('JavaScript',5,[
 ["A Getter Uses the Receiver",'const base = {get x() { return this.y; }};\nconst child = Object.create(base);\nchild.y = 9;\nconsole.log(child.x);','9',['undefined','null','TypeError'],'An inherited getter is called with the receiving object as this.'],
 ["Reactions After await",'async function f() {\n  console.log(1);\n  await 0;\n  console.log(2);\n}\nf();\nconsole.log(3);','1, 3, 2',['1, 2, 3','3, 1, 2','2, 1, 3'],'Even awaiting a non-promise suspends continuation until a later promise job.'],
 ["Proxy Receiver Forwarding",'const proxy = new Proxy(target, {\n  get(t, key, receiver) {\n    return ____(t, key, receiver);\n  }\n});','Reflect.get',null,'Reflect.get preserves the receiver for accessor evaluation rather than forcing target as this.','Use the reflective get operation.'],
 ["An async Executor Trap",'new Promise(async (resolve, reject) => {\n  throw new Error("boom");\n});','The outer promise can remain pending while the executor’s promise rejects',['The outer promise always rejects','resolve is called automatically','The throw is a syntax error'],'Promise ignores the executor return value. An async executor returns its own rejected promise instead of throwing synchronously to the constructor.'],
 ["WeakMap Key Requirements",'const w = new WeakMap();\nw.set(42, "answer");','TypeError',['Stores the entry','Coerces 42 to an object','Returns false'],'A number is not an eligible weak key. Objects are eligible; modern JavaScript also permits non-registered symbols.']
]);
pack('Python',1,[
 ["Measure a List",'values = [1, 2, 3]\nprint(____(values))','len',null,'len returns the container’s number of elements.'],
 ["An Exclusive Range Endpoint",'print(list(range(2, 5)))','[2, 3, 4]',['[2, 3, 4, 5]','[3, 4, 5]','[2, 5]'],'range includes its start and excludes its stop.'],
 ["Test Membership",'print("a" in {"a": 1, "b": 2})','True',['False','1','TypeError'],'Dictionary membership tests keys rather than values.']
]);
pack('Python',2,[
 ["Build Squares With a Comprehension",'squares = [____ for n in range(3)]','n * n',null,'The expression runs for each n, yielding [0, 1, 4].'],
 ["Get a Fallback Value",'print({}.get("count", 0))','0',['None','KeyError','False'],'dict.get returns the provided default when the key is absent.'],
 ["Unpack a Trailing Sequence",'first, *rest = [1, 2, 3]\nprint(rest)','[2, 3]',['(2, 3)','3','[1, 2, 3]'],'The starred assignment target receives a list of remaining elements.']
]);
pack('Python',3,[
 ["Consume a Generator Once",'g = (n for n in range(2))\nprint(list(g), list(g))','[0, 1] []',['[0, 1] [0, 1]','[] []','TypeError'],'Generators are iterators that stay exhausted after consumption.'],
 ["Cleanup During an Exception",'try:\n    raise ValueError("bad")\nfinally:\n    print("cleanup")','Prints cleanup, then propagates ValueError',['Suppresses ValueError','Prints nothing','Returns None'],'finally executes as the exception leaves the try statement unless it changes the completion.'],
 ["Sort by a Field",'rows = [{"n": 3}, {"n": 1}]\nrows.sort(key=lambda row: ____)','row["n"]',null,'The key function extracts each row’s comparison value.'],
 ["Shared Nested Rows",'grid = [[0] * 2] * 2\ngrid[0][0] = 9\nprint(grid[1][0])','9',['0','2','IndexError'],'List multiplication repeats references to the same inner list.'],
 ["nonlocal Updates the Enclosing Binding",'def outer():\n    x = 0\n    def bump():\n        nonlocal x\n        x += 1\n    bump()\n    return x\nprint(outer())','1',['0','UnboundLocalError','None'],'nonlocal selects the nearest enclosing function binding.']
]);
pack('Python',4,[
 ["Class Attributes Can Share Mutable State",'class C:\n    items = []\na, b = C(), C()\na.items.append(1)\nprint(b.items)','[1]',['[]','AttributeError','None'],'Both instances read the class list unless an instance attribute shadows it.'],
 ["Late Binding in Closures",'fs = [lambda: n for n in range(3)]\nprint([f() for f in fs])','[2, 2, 2]',['[0, 1, 2]','[0, 0, 0]','NameError'],'The closures read the shared comprehension binding when called. Use a default argument to capture each value.'],
 ["Cache Keys Must Be Hashable",'from functools import lru_cache\n@lru_cache()\ndef total(xs): return sum(xs)\ntotal([1, 2])','TypeError',['3','0','Automatically caches a tuple'],'lru_cache hashes arguments. Lists are unhashable; a tuple of hashable values is suitable.'],
 ["An async Function Is Not Called by Awaiting Nothing",'async def f():\n    print("work")\ncoro = f()','Creates a coroutine; the body has not run',['Prints work immediately','Creates an OS thread','Returns None'],'Calling an async function creates a coroutine object. Await or schedule it to execute its body.'],
 ["Context Manager Suppression",'class C:\n    def __enter__(self): return self\n    def __exit__(self, *args): return True\nwith C():\n    raise ValueError()\nprint("ok")','Prints ok; the exception is suppressed',['ValueError propagates','TypeError','Prints nothing'],'A truthy __exit__ result suppresses the exception from the with body.']
]);
pack('Python',5,[
 ["A Property Has Descriptor Precedence",'class C:\n    @property\n    def x(self): return 1\nc = C()\nc.__dict__["x"] = 9\nprint(c.x)','1',['9','AttributeError','None'],'property is a data descriptor, which takes precedence over an instance dictionary entry.'],
 ["Cooperative Diamond Inheritance",'class A: pass\nclass B(A): pass\nclass C(A): pass\nclass D(B, C): pass\nprint([t.__name__ for t in D.__mro__])','D, B, C, A, object',['D, B, A, C, object','D, C, B, A, object','TypeError'],'C3 linearization preserves local precedence and visits the shared base once.'],
 ["TaskGroup Failure Semantics",'async with asyncio.TaskGroup() as group:\n    group.create_task(fails_with_value_error())\n    group.create_task(long_task())','Cancels the sibling and propagates an exception group',['Silently drops the failure','Never cancels siblings','Only returns a boolean'],'A non-cancellation failure causes TaskGroup to cancel remaining tasks, await them, and raise grouped failures.'],
 ["Generator Cleanup on Close",'def g():\n    try:\n        yield 1\n    finally:\n        print("closed")\nit = g(); next(it); it.close()','Prints closed',['Prints nothing','Yields 2','Always raises StopIteration to the caller'],'close injects GeneratorExit into the suspended generator and runs its finally block.'],
 ["Equality Must Agree With Hashing",'class Key:\n    def __eq__(self, other): return isinstance(other, Key)\n    __hash__ = object.__hash__\n# Use many Key objects as dictionary keys.','Equal objects can have unequal hashes; the contract is broken',['All keys automatically share a hash','Dictionary ignores equality','This class cannot be defined'],'Hashable equal objects must have equal hashes. Identity hashes are inconsistent with this equality rule.']
]);
pack('C',1,[
 ["Read Through a Pointer",'int n = 7;\nint *p = &n;\nprintf("%d", ____);','*p',null,'Dereferencing p accesses the int it points to.'],
 ["End a C String",'char s[] = {\'h\', \'i\', ____};','\'\\0\'',null,'A C string ends with a null character. It is not the digit zero.'],
 ["Logical Conjunction",'int ok = (3 > 1) ____ (2 < 4);','&&',null,'&& computes logical AND and short-circuits if the left operand is false.']
]);
pack('C',2,[
 ["sizeof an Array",'int a[4] = {0};\nprintf("%zu", sizeof a / sizeof a[0]);','4',['1','Depends on pointer size','0'],'Here a is an actual array, so sizeof a includes all four elements.'],
 ["Assign Through a Pointer",'int n = 2;\nint *p = &n;\n*p = 8;\nprintf("%d", n);','8',['2','Address of n','Undefined behavior'],'p points to n; writing *p updates n.'],
 ["Short-Circuit Protects a Dereference",'int *p = NULL;\nif (p != NULL && *p == 1) { /* ... */ }','The right operand is not evaluated',['Always dereferences NULL','Both operands run in parallel','Compilation error'],'&& evaluates its right operand only if the left operand is true.']
]);
pack('C',3,[
 ["Arrays Decay in Parameters",'void f(int a[10]) {\n    // What does sizeof a measure here?\n}','A pointer size',['Ten ints','One int','The caller’s array length'],'An array parameter is adjusted to a pointer type. Pass length separately.'],
 ["Safe realloc Ownership",'int *tmp = realloc(p, new_size);\nif (tmp) p = tmp;','Keeps the original p if realloc fails with nonzero new_size',['Leaks p on every success','Frees p on every failure','Always doubles allocation size'],'On failure for a nonzero size, realloc leaves the original allocation unchanged.'],
 ["Overlapping Memory Copies",'char s[] = "abcde";\n____(s + 1, s, 4);','memmove',null,'memmove supports overlapping source and destination. memcpy does not.'],
 ["Unsigned Wraparound",'unsigned int x = UINT_MAX;\nx += 1;\nprintf("%u", x);','0',['Undefined behavior','UINT_MAX','-1'],'Unsigned arithmetic wraps modulo one more than the maximum representable value.'],
 ["Check snprintf Truncation",'char buf[4];\nint n = snprintf(buf, sizeof buf, "%s", "hello");','n is 5; buf contains "hel" plus a terminator',['n is 3','n is 4; no terminator','Writes all six bytes'],'snprintf returns the required length excluding the terminator and truncates to fit the buffer.']
]);
pack('C',4,[
 ["Signed Overflow",'int x = INT_MAX;\nx = x + 1;','Undefined behavior',['Guaranteed INT_MIN','Guaranteed zero','Defined modulo arithmetic'],'Signed integer overflow is undefined; unsigned wraparound is different.'],
 ["Double Ownership After free",'int *p = malloc(sizeof *p);\nif (p) { free(p); free(p); }','The second free has undefined behavior',['The second free is always ignored','Both frees are required','Only a memory leak occurs'],'An allocation may be freed only once. free(NULL) is harmless but this pointer was not nullified.'],
 ["Return a Pointer Into a Local Array",'char *f(void) {\n    char buf[8] = "hello";\n    return buf;\n}','The returned pointer refers to an expired object',['The array is automatically copied','The string always has static storage','The pointer extends array lifetime'],'The automatic array’s lifetime ends when the function returns.'],
 ["Two Modifications Without Sequencing",'int i = 1;\nint n = i++ + i++;','Undefined behavior',['n is always 3','n is always 4','n is always 2'],'The additions do not sequence the two side effects on i.'],
 ["Initialize Allocated Objects Before Reading",'int *p = malloc(sizeof *p);\nif (p) printf("%d", *p);','The allocation does not initialize the int; do not read it first',['Always prints zero','Always prints the allocation size','malloc fills it with 1'],'malloc provides storage, not an initialized int value. Write a value before reading it.']
]);
pack('C',5,[
 ["A restrict Promise",'void f(int *restrict a, int *restrict b) {\n    *a = 1; *b = 2;\n}\nint x; f(&x, &x);','Violates the restrict access contract; undefined behavior',['Always a valid way to swap','restrict copies the pointers','Compiler must reject the call'],'Both restricted access paths modify the same object during the block, violating their aliasing promise.'],
 ["Atomic Does Not Publish Unrelated Data by Itself",'// Thread 1: data = 42; atomic_store_explicit(&ready, 1, memory_order_relaxed);\n// Thread 2: if (atomic_load_explicit(&ready, memory_order_relaxed)) use(data);','No publication guarantee for non-atomic data; a race is possible',['Relaxed guarantees data is visible','All atomics act as full barriers','volatile data would fix it'],'Relaxed flag operations do not establish synchronization for the non-atomic data. Release/acquire can publish it.'],
 ["Read Object Representation",'int value = 42;\nunsigned char *bytes = (unsigned char *)&value;','Character-type access may inspect the object representation',['Always violates aliasing','Always yields decimal ASCII','Requires a union'],'C permits a character-type lvalue to inspect another object’s representation; byte order is implementation-dependent.'],
 ["One-Past Pointer",'int a[3] = {0};\nint *end = a + 3;','Forming end is valid; dereferencing it is not',['Forming end is already undefined','Dereferencing end returns zero','end must equal NULL'],'A pointer one past an array supports bounds and comparisons but does not designate an element.'],
 ["Bit Shifts Need a Valid Count",'unsigned int x = 1;\nunsigned int y = x << (sizeof x * CHAR_BIT);','Undefined behavior',['Always zero','Always one','Implementation-defined but valid'],'The shift count must be less than the width of the promoted left operand.']
]);
pack('C++',1,[
 ["Value Initialization",'int n{};\nstd::cout << n;','0',['Unspecified','1','Compilation error'],'Value-initialization initializes this int to zero.'],
 ["Use a Range-Based Loop",'for (int n ____ std::vector<int>{1, 2}) {\n    std::cout << n;\n}',':',null,'A colon separates the declaration from the range in a range-based for loop.'],
 ["Return a Function Result",'int square(int n) { ____ n * n; }','return',null,'return supplies the result of this non-void function.']
]);
pack('C++',2,[
 ["Modify Elements by Reference",'std::vector<int> v{1, 2};\nfor (auto n : v) n *= 2;\nstd::cout << v[0];','1',['2','4','Compilation error'],'auto n copies each element. auto& n would refer to the original element.'],
 ["Bounds-Checked Access",'std::vector<int> v{1};\nv.at(3);','Throws std::out_of_range',['Returns zero','Returns the last element','Always undefined behavior'],'at checks bounds; unchecked operator[] requires a valid index.'],
 ["Const Reference Binding",'const std::string& s = std::string("hi");\n// How long does the temporary live?','Until this local reference goes out of scope',['Only until the semicolon','Forever','Until the next allocation'],'This direct local reference initialization extends the temporary’s lifetime.']
]);
pack('C++',3,[
 ["Move Unique Ownership",'auto p = std::make_unique<int>(4);\nauto q = std::move(p);','q owns the int and p is empty',['Both pointers own it','The int is copied','Compilation always fails'],'Moving unique_ptr transfers ownership and leaves the source empty.'],
 ["Destruction Order",'struct T { ~T() { std::cout << id; } int id; };\n{ T a{1}; T b{2}; }','2 then 1',['1 then 2','Only 1','No destructors run'],'Automatic objects are destroyed in reverse order of completed construction.'],
 ["A Map Lookup Can Insert",'std::map<std::string, int> m;\nint n = m["missing"];\nstd::cout << m.size();','1',['0','2','Throws out_of_range'],'operator[] inserts a missing key with a value-initialized mapped value.'],
 ["Const Applies to the Pointed-to Type",'const int *p = &a;\n// Which operation is permitted for non-const p?','Assign p to point at another int',['Modify *p','Neither reassignment nor dereference','Delete any object through p'],'The pointed-to int is const through p; the pointer variable itself is not const.'],
 ["Erase-Remove Idiom",'v.erase(std::remove(v.begin(), v.end(), 0), v.end());','Removes zero-valued elements and shrinks the vector',['Only overwrites all values with zero','Never changes size','Sorts the vector'],'remove compacts retained values; erase removes the tail and changes the size.']
]);
pack('C++',4,[
 ["Polymorphic Deletion",'struct Base { virtual void f() {} ~Base() {} };\nstruct Derived : Base {};\nBase *p = new Derived;\ndelete p;','Undefined behavior: Base lacks a virtual destructor',['Always calls both destructors','Only a harmless leak','Compile-time error is required'],'Deleting a derived object through this base pointer requires an appropriate virtual destructor.'],
 ["std::move Is a Cast",'std::string s = "hello";\nstd::move(s);\nstd::cout << s;','hello',['Empty string','Undefined behavior','Compilation error'],'std::move only produces an rvalue expression; no move occurs unless an operation consumes it.'],
 ["A Span Does Not Own Storage",'std::span<int> f() {\n    std::vector<int> v{1, 2};\n    return v;\n}','The returned view dangles',['span copies the vector','span owns v','The vector becomes static'],'A span does not extend the lifetime of its backing storage.'],
 ["Catch by Reference",'try { throw DerivedError{}; }\ncatch (BaseError e) { /* ... */ }\n// DerivedError publicly derives from BaseError.','The catch parameter slices the exception object',['Catch always preserves dynamic type in e','The exception cannot match','Reference counting prevents slicing'],'A by-value base parameter copies only the base part. Catch const BaseError& to avoid slicing.'],
 ["Destroying Shared Cycles",'struct N { std::shared_ptr<N> next; };\na->next = b; b->next = a;\na.reset(); b.reset();','The ownership cycle can keep both objects alive',['Both always get destroyed','shared_ptr detects cycles','The program cannot compile'],'Reference counts in a cycle never reach zero. A weak_ptr can break the owning cycle.']
]);
pack('C++',5,[
 ["Dependent Type Names",'template<class T> void f() {\n    ____ T::value_type value{};\n}','typename',null,'The dependent qualified name needs typename here so it is treated as a type.'],
 ["Forwarding Reference Preservation",'template<class T> void f(T&& arg) {\n    consume(std::forward<T>(arg));\n}\nint x = 1; f(x);','T deduces as int&; forwarding preserves an lvalue',['T is always int','arg is always forwarded as rvalue','Calling f with x is invalid'],'For a forwarding reference, an lvalue argument deduces a reference type and reference collapsing preserves it.'],
 ["Vector Relocation and Noexcept",'// T has a usable copy constructor and a potentially throwing move constructor.\n// Why might vector copy elements during reallocation?','To preserve its exception-safety guarantee',['Because moves are always slower','Because std::move copies','Because vector cannot hold movable types'],'Copying can preserve the original elements if relocation throws; a noexcept move often permits moving instead.'],
 ["Acquire Pairs With Release",'// Producer: data = 42; ready.store(true, std::memory_order_release);\n// Consumer: if (ready.load(std::memory_order_acquire)) use(data);\n// ready initially false; only one producer writes data.','Observing that release publishes the prior data write',['Acquire always locks a mutex','Non-atomic data can never be published','The release orders only writes after it'],'When the acquire observes the release, prior producer writes happen-before subsequent consumer reads.'],
 ["Guaranteed Copy Elision",'struct T { T() = default; T(const T&) = delete; T(T&&) = delete; };\nT make() { return T{}; }\nT x = make();','Valid in C++17 and later due to guaranteed prvalue elision',['Requires a move constructor','Requires a copy constructor','Only valid with compiler extensions'],'The prvalue initializes the result object directly; this differs from optional NRVO for a named local.']
]);
pack('Rust',1,[
 ["Create a Growable Vector",'let values = ____![1, 2, 3];','vec',null,'vec! constructs a Vec, whereas [1, 2, 3] is an array.'],
 ["Check an Option Variant",'let value = Some(3);\nprintln!("{}", value.is_some());','true',['false','3','Compilation error'],'is_some reports whether the Option contains a value.'],
 ["An Exclusive Range",'let n: usize = (0..3).count();\nprintln!("{}", n);','3',['2','4','Compilation error'],'The .. range excludes its ending bound.']
]);
pack('Rust',2,[
 ["Handle a Missing Optional Value",'let n: Option<i32> = None;\nprintln!("{}", n.unwrap_or(7));','7',['0','Panic','Compilation error'],'unwrap_or supplies the fallback when the Option is None.'],
 ["Borrow a String Slice",'fn length(s: ____ str) -> usize { s.len() }','&',null,'&str borrows a string slice without taking ownership.'],
 ["Iterators Are Lazy",'let v = vec![1, 2, 3];\nlet iter = v.iter().map(|x| x * 2);','The mapping runs as iter is consumed',['All mapped values are already stored in a new Vec','map mutates v','map always spawns a thread'],'map is an iterator adapter. collect, a loop, or another consumer drives it.']
]);
pack('Rust',3,[
 ["Propagate a Result Error",'fn read() -> Result<String, std::io::Error> {\n    let s = std::fs::read_to_string("a.txt")____;\n    Ok(s)\n}','?',null,'? returns early on Err and extracts the success value on Ok.'],
 ["Interior Mutability Checks",'let cell = std::cell::RefCell::new(1);\nlet a = cell.borrow_mut();\nlet b = cell.borrow_mut();\n// a is still live.','Panics on the second mutable borrow',['Creates two safe mutable borrows','Compilation always fails','Silently returns None'],'RefCell checks borrowing at runtime; overlapping mutable borrows violate its rules.'],
 ["An Rc Is Shared Ownership",'let a = std::rc::Rc::new(3);\nlet b = a.clone();\nprintln!("{}", std::rc::Rc::strong_count(&a));','2',['1','3','Compilation error'],'Rc::clone increments the strong count rather than cloning the contained int.'],
 ["Match Exhaustively",'let value: Option<i32> = None;\nmatch value { Some(n) => println!("{}", n) }','Compilation error: missing None case',['Prints zero','Runtime panic','Compiles and does nothing'],'match must cover every possible variant unless a catch-all covers the rest.'],
 ["Mutate While a Borrow Stays Live",'let mut v = vec![1];\nlet first = &v[0];\nv.push(2);\nprintln!("{}", first);','Rejected due to overlapping immutable and mutable borrows',['Always prints 1','Automatically copies first','Undefined behavior in safe Rust'],'push needs mutable access while first is still used, and could reallocate the vector.']
]);
pack('Rust',4,[
 ["A Returned Reference Needs an Owner",'fn bad() -> &str {\n    let s = String::from("hi");\n    &s\n}','Cannot return a reference to the local String',['The compiler makes s static','&str owns the bytes','Always returns an empty string'],'The local owner is dropped on return. Return String or borrow caller-owned input.'],
 ["Share Across Threads",'let n = std::rc::Rc::new(1);\nstd::thread::spawn(move || println!("{}", n));','Rejected because Rc is not Send',['Copies Rc atomically','Always panics','Accepted because the closure is move'],'A move closure transfers captured ownership, but thread transfer still requires Send. Arc supports atomic shared ownership.'],
 ["A Mutex Lock Can Be Poisoned",'let result = mutex.lock();\n// Another thread panicked while holding this mutex.','lock can return an Err containing a poison error',['All data is automatically reset','The mutex is permanently deleted','lock can only return Ok'],'Poisoning flags potentially broken invariants. The lock result lets the caller choose recovery.'],
 ["Borrow Before Mutation With NLL",'let mut v = vec![1];\nlet first = &v[0];\nprintln!("{}", first);\nv.push(2);','Accepted: the borrow ends after its last use',['Rejected because first exists until scope end','push must be unsafe','The first element is moved'],'Non-lexical lifetimes can end a borrow when its final use occurs.'],
 ["Move a Value Into a Closure",'let s = String::from("hi");\nlet f = move || drop(s);\nf();\nf();','The second call is rejected because f is FnOnce',['Both calls are valid','The String is cloned each call','The first call is rejected'],'Dropping the capture consumes it, so calling the closure consumes the closure.']
]);
pack('Rust',5,[
 ["Pin Is a Movement Guarantee",'// A self-referential !Unpin value is validly pinned.\n// May safe code move it out through Pin<&mut T>?','No; pinning restricts moving the pointee',['Yes, Pin is only a naming convention','Yes, every T implements Unpin','No references to pinned values are allowed'],'Pin’s contract protects address-sensitive values. It does not make every use of self-references automatically safe.'],
 ["A Future Holds Rc Across await",'async fn f() {\n    let value = std::rc::Rc::new(1);\n    pause().await;\n    println!("{}", value);\n}\n// pause is a Send future.','f’s future is not Send because it retains Rc across suspension',['Every async future is Send','Rc becomes Arc at await','The future must run immediately'],'A future’s suspended state must be Send to move safely between threads.'],
 ["Release and Acquire Publish Data",'// Producer writes data, then sets ready with Release.\n// Consumer observes that store with Acquire, then reads data.','The data writes before Release happen-before reads after Acquire',['Relaxed would provide the same synchronization','Acquire changes ownership','Only SeqCst can publish data'],'The acquire observation of the release establishes the synchronization edge. Correct storage access is still required.'],
 ["Trait Object Compatibility",'trait Factory { fn make<T>(&self) -> T; }\n// Can this trait be used as dyn Factory?','No: this dispatchable generic method prevents dyn compatibility',['Yes for every generic method','Only if T is an int','dyn automatically monomorphizes every possible T'],'A vtable cannot provide an unbounded set of generic instantiations. Restricting the method to Self: Sized can exclude it from object dispatch.'],
 ["Unsafe Raw Pointers Retain Obligations",'let p = std::ptr::null::<i32>();\nunsafe { println!("{}", *p); }','Undefined behavior; unsafe does not validate the pointer',['Always prints zero','Guaranteed panic','Compilation must reject all raw pointers'],'unsafe allows operations with proof obligations; a dereferenced pointer must still be valid and aligned.']
]);
pack('Java',1,[
 ["Print a String Length",'System.out.println("code".____());','length',null,'String.length() returns its UTF-16 code-unit length, here 4.'],
 ["Read a Boolean Condition",'System.out.println(3 > 2 && 1 < 2);','true',['false','1','Compilation error'],'Both comparisons are true, so logical AND is true.'],
 ["Construct an Array",'int[] values = ____ int[3];','new',null,'new int[3] allocates an array with three zero-initialized elements.']
]);
pack('Java',2,[
 ["An Instance Field Defaults to Zero",'class C { int n; }\nSystem.out.println(new C().n);','0',['Uninitialized random value','null','Compilation error'],'Instance int fields are initialized to zero. Local variables require definite assignment.'],
 ["List Size",'var values = new java.util.ArrayList<Integer>();\nvalues.add(3);\nSystem.out.println(values.size());','1',['0','3','Compilation error'],'size() counts list elements.'],
 ["Integer Division Before Assignment",'double n = 5 / 2;\nSystem.out.println(n);','2.0',['2.5','3.0','Compilation error'],'Integer division happens before conversion to double. Use 5.0 / 2 for a fractional result.']
]);
pack('Java',3,[
 ["Unbox a null Wrapper",'Integer n = null;\nint x = n;','NullPointerException',['0','Compilation error','null'],'Unboxing invokes the wrapper’s value conversion; null cannot be unboxed.'],
 ["Finally Replaces the Result",'int f() {\n  try { return 1; }\n  finally { return 2; }\n}','Returns 2',['Returns 1','Compilation error','Returns 3'],'The abrupt return in finally overrides the pending return from try.'],
 ['Mutability of List.of','var values = java.util.List.of(1, 2);\nvalues.add(3);','UnsupportedOperationException',['List becomes [1, 2, 3]','NullPointerException','Compilation error'],'List.of creates an unmodifiable list.'],
 ["Resource Cleanup",'try (var in = new java.io.FileInputStream("a.txt")) {\n  // read file\n}','Closes in when leaving the try body, including exceptional exit',['Closes only on normal exit','Never closes automatically','Requires finally to compile'],'Try-with-resources automatically closes successfully initialized resources.'],
 ["Override Dispatch",'class A { String name() { return "A"; } }\nclass B extends A { String name() { return "B"; } }\nA x = new B();\nSystem.out.println(x.name());','B',['A','null','Compilation error'],'Overridden instance methods dispatch according to the actual object type.']
]);
pack('Java',4,[
 ["Mutable HashMap Keys",'// key.hashCode() depends on key.id.\nmap.put(key, "value");\nkey.id++;\nmap.get(key);','May fail to find the entry because its hash changed',['HashMap automatically relocates it','Always finds it by identity','Mutation clears the entire map'],'Hash-based keys must preserve equality and hash behavior while stored.'],
 ["PECS for Producers",'java.util.List<? extends Number> xs = ...;\n// Can xs.add(Integer.valueOf(1)) be called?','No: the unknown element type might be a narrower subtype',['Yes because Integer is a Number','Yes if the list is nonempty','Only primitive ints are accepted'],'An extends wildcard is suitable for reading Numbers, not adding an arbitrary Number subtype.'],
 ["Streams Are Single-Use",'var stream = java.util.stream.Stream.of(1, 2);\nstream.count();\nstream.count();','IllegalStateException on reuse',['Both return 2','Second returns 0','Streams cache all results'],'A terminal operation consumes a stream pipeline. Create a new stream for another traversal.'],
 ["Monitor Ownership",'Object lock = new Object();\nlock.wait();\n// Current thread does not own lock’s monitor.','IllegalMonitorStateException',['Always sleeps forever','Automatically acquires the monitor','Compilation error'],'wait requires monitor ownership, typically inside synchronized(lock).'],
 ["Interrupted Waits",'try { Thread.sleep(10000); }\ncatch (InterruptedException e) {\n  Thread.currentThread().interrupt();\n}','Restores the thread’s interrupted status',['Automatically retries sleep','Terminates all threads','Suppresses all future interrupts'],'Blocking methods often clear the status when throwing; re-interrupting preserves the cancellation signal for callers.']
]);
pack('Java',5,[
 ["Publish Through a volatile Flag",'// Producer: data = 42; ready = true;\n// Consumer: if (ready) use(data);\n// ready is volatile, initially false; one writer only.','Reading the published true establishes visibility of prior data writes',['volatile affects only the flag’s arithmetic','data must also be volatile in this pattern','No visibility is possible without synchronized'],'A volatile write happens-before a subsequent read observing it, publishing preceding writes.'],
 ["Lost Updates on volatile",'volatile int count;\nvoid increment() { count++; }','Still not an atomic increment',['Always atomic because volatile','Compiles to a mutex','Each thread has its own field'],'Visibility and ordering do not make the read-modify-write indivisible. Use an atomic or synchronization.'],
 ["Suppressed Close Exceptions",'// Try body throws A; resource.close() then throws B.\ntry (resource) { throw A; }','A propagates and B is attached as suppressed',['B replaces A','Both exceptions are discarded','A and B always form an ExceptionGroup'],'Try-with-resources retains the body exception and attaches close failures as suppressed exceptions.'],
 ["Array Covariance Is Checked at Runtime",'Object[] values = new String[1];\nvalues[0] = Integer.valueOf(1);','ArrayStoreException',['Compilation error','Stores the Integer','ClassCastException on array construction'],'Arrays retain their runtime component type even through a covariant reference.'],
 ["Class Initialization Failure",'// C’s static initializer throws a RuntimeException.\n// First active use attempts initialization; later the same loader uses C again.','First may throw ExceptionInInitializerError; later use gets NoClassDefFoundError',['Initialization retries on every use','All fields become default values permanently usable','Only checked exceptions can fail initialization'],'A failed initialization marks the class erroneous for that class loader.']
]);
pack('VHDL',1,[
 ["Assign a Variable",'variable count : integer := 0;\n-- Inside a process:\ncount ____ count + 1;',':=',null,'Variables use := and update immediately within process execution.'],
 ["Negate a Logic Signal",'y <= ____ a;','not',null,'not is the logical negation operator for std_logic.'],
 ["Select an Array Element",'signal bus_data : std_logic_vector(7 downto 0);\ny <= bus_data(0);','Selects the least-numbered index, bit 0',['Selects all eight bits','Selects bit 7','Always selects the sign bit'],'An indexed name selects the specified element; meaning depends on the declared range.']
]);
pack('VHDL',2,[
 ["Compare Logic Values",'if enable ____ \'1\' then\n  q <= d;\nend if;','=',null,'Equality uses =, not the C-style == operator.'],
 ["Declare an unsigned Counter",'signal count : ____ (7 downto 0);','unsigned',null,'numeric_std unsigned supports unsigned arithmetic on vectors.'],
 ["Specify a Combinational Sensitivity Set",'process(all)\nbegin\n  y <= a xor b;\nend process;','Reevaluates when relevant read signals change',['Runs only on clock edges','Runs only once in simulation','Makes y a variable'],'VHDL-2008 process(all) supplies the sensitivity set based on signals read by the process.']
]);
pack('VHDL',3,[
 ["Unsigned Arithmetic Wraps at Width",'-- count is unsigned(3 downto 0), initially "1111".\ncount <= count + 1;','"0000"',['"10000"','"1111"','An integer overflow exception'],'The four-bit result wraps; a wider destination does not by itself widen this operation.'],
 ["Variable Updates Are Immediate",'-- Inside a process, v is an integer variable.\nv := 1;\nv := v + 1;\ny <= v;','Schedules y to receive 2',['Schedules y to receive 1','Schedules y to receive 0','No update is scheduled'],'The second variable assignment sees the value from the first.'],
 ["Convert an unsigned Vector",'-- bits is unsigned(7 downto 0).\nvalue <= ____(bits);','to_integer',null,'numeric_std to_integer converts the unsigned value to an integer.'],
 ["Asynchronous Reset Ordering",'process(clk, reset)\nbegin\n  if reset = \'1\' then q <= \'0\';\n  elsif rising_edge(clk) then q <= d;\n  end if;\nend process;','Reset can affect q without waiting for a rising edge',['Reset is always synchronous','Reset has lower priority than the clock','Describes only a latch'],'The reset branch is evaluated when reset changes and takes priority.'],
 ["Read the Old Signal Value",'-- s is integer, initially 0; inside one process execution:\ns <= 1;\ny <= s;','y receives the old s value, 0',['y always receives 1','s changes immediately','The code cannot assign twice'],'Signal updates are scheduled; reading s in this execution sees its current value.']
]);
pack('VHDL',4,[
 ["Avoid Truncating a Sum",'-- a and b are unsigned(7 downto 0); sum is unsigned(8 downto 0).\nsum <= resize(a, 9) + resize(b, 9);','Preserves the ninth carry bit',['Always discards the carry','Is equivalent to resize(a + b, 9) for all values','Treats the operands as signed'],'Widening the operands before addition makes the operation nine bits wide.'],
 ["Interpret signed Versus unsigned",'-- bits is "1111".\nto_integer(signed(bits))','-1',['15','0','1'],'Four-bit two’s-complement signed 1111 represents -1; unsigned interpretation gives 15.'],
 ["Two Drivers Are Resolved",'-- Two concurrent drivers of std_logic signal s:\ns <= \'0\';\ns <= \'1\';','The resolved value is X',['Last textual assignment wins','The value is always 1','Both drivers are ignored'],'Conflicting strong std_logic drivers resolve to X in simulation.'],
 ["A Missing Clock Sensitivity",'process(reset)\nbegin\n  if reset = \'1\' then q <= \'0\';\n  elsif rising_edge(clk) then q <= d;\n  end if;\nend process;','Simulation will not wake this process on clk alone',['rising_edge adds clk automatically','clk is ignored only by synthesis','This is equivalent to process(all)'],'An explicit sensitivity list must include clk for this process to react to its events.'],
 ["Pure Combinational Mux",'y <= a when sel = \'1\' else b;','Assigns y for both branches; no storage is required by this mux',['Necessarily infers a flip-flop','Infers a latch because sel exists','Only updates at rising edges'],'A complete concurrent conditional assignment describes combinational selection.']
]);
pack('VHDL',5,[
 ["Count Delta-Cycle Propagation",'-- Settled a = b = c = \'0\'. Then a changes to \'1\'.\nb <= a;\nc <= b;','c updates after propagation through later delta cycles',['c necessarily updates in the same delta as a','Each assignment consumes one nanosecond','c never changes'],'Zero-delay signal scheduling can take multiple delta cycles while simulation time stays unchanged.'],
 ["Metastability Mitigation",'-- An asynchronous single-bit status enters a clock domain.\n-- What is a common receiving-domain structure?','Two cascaded flip-flops, with appropriate CDC constraints',['One combinational inverter','A wider unsigned cast','Two unrelated clocks driving one register'],'A synchronizer reduces the probability of metastability propagation; it does not guarantee zero risk or coherent multi-bit transfer.'],
 ["Ready-Valid Transfer Condition",'-- A synchronous stream has valid and ready signals.\n-- When does a transfer occur?','At the active clock edge when valid and ready are both 1',['Whenever either signal changes','Whenever valid alone is 1','Only on a falling edge of ready'],'The handshake requires both signals at the sampling edge. The source must retain pending data during backpressure.'],
 ["A Synchronizer Is Not a Bus Coherency Protocol",'-- Each bit of an asynchronous 8-bit bus uses its own two-flop synchronizer.','The receiving word can mix bits from different source values',['The word is automatically atomic','Two stages eliminate all CDC concerns','All bits necessarily arrive on one cycle'],'Independent synchronization does not preserve multi-bit word coherency; use an appropriate handshake or asynchronous FIFO.'],
 ["Resize a Negative signed Value",'-- x is signed(3 downto 0), x = "1110" (-2).\nresize(x, 8)','"11111110"',['"00001110"','"00000010"','"11110000"'],'Widening signed with numeric_std resize sign-extends to preserve the value.']
]);
pack('Bash',1,[
 ["Assign Without Spaces",'____\necho "$name"','name="Ada"',['name = "Ada"','set name "Ada"','let name = Ada'],'A shell assignment uses name=value with no surrounding spaces.'],
 ["Expand a Variable",'name="Ada"\nprintf "%s\\n" "____"','$name',null,'Double quotes allow parameter expansion while preserving a single argument.'],
 ["Read the First Positional Argument",'printf "%s\\n" "____"','$1',null,'$1 refers to the first argument supplied to the script or function.']
]);
pack('Bash',2,[
 ["Perform Integer Arithmetic",'n=3\necho "$((n + 2))"','5',['n + 2','32','Syntax error'],'$((...)) performs shell arithmetic rather than string concatenation.'],
 ["Test a Regular File",'if [[ ____ "$path" ]]; then echo file; fi','-f',null,'-f tests whether the path exists and is a regular file.'],
 ["Return an Explicit Exit Code",'exit ____ # report success','0',null,'A status of zero conventionally reports success.']
]);
pack('Bash',3,[
 ["Preserve Every Argument",'for arg in "____"; do\n  printf "%s\\n" "$arg"\ndone','$@',null,'Quoted "$@" expands each positional argument as a separate word, preserving empty arguments and spaces.'],
 ["Default a Missing or Empty Value",'unset n\necho "${n:-7}"','7',['Empty line','n','Parameter error'],'The :- form substitutes the fallback when a parameter is unset or empty.'],
 ["Command Substitution Removes Trailing Newlines",'x=$(printf "a\\n\\n")\nprintf "<%s>" "$x"','<a>',['<a\n\n>','<>','<a\n>'],'Command substitution strips all trailing newline characters from its output.'],
 ["Declare an Indexed Array",'items=("one two" three)\necho "${#items[@]}"','2',['3','1','0'],'There are two array elements; quoted whitespace remains within the first.'],
 ["Register Cleanup on Exit",'____ \'rm -f -- "$tempfile"\' EXIT','trap',null,'An EXIT trap can run cleanup when the shell exits. This is quiz text, not an executed deletion.']
]);
pack('Bash',4,[
 ["Redirect Stdout and Stderr in Order",'command >out.log 2>&1','Both streams go to out.log',['Only stderr goes to out.log','stdout stays on the terminal','The order never matters'],'stderr duplicates the already-redirected stdout descriptor. Reversing these redirections can change the result.'],
 ["A Failed Command in an If Condition",'set -e\nif false; then echo yes; fi\necho survived','Prints survived',['The shell necessarily exits at false','Prints yes','Syntax error'],'errexit has exceptions for tested conditions, including commands in an if test.'],
 ["A Glob That Matches Nothing",'shopt -u nullglob failglob\nfor f in definitely_missing_*.txt; do\n  printf "%s\\n" "$f"\ndone\n# No files match.','Prints the literal pattern',['Runs zero iterations','Always exits with an error','Prints every file'],'With both options off, an unmatched pathname pattern remains literal.'],
 ["Use a Format String Safely",'printf "$input"\n# input comes from a user.','Use printf "%s" "$input" instead',['Use eval before printf','Remove all quotes','Only numeric input can be printed'],'User data should be an argument, not the printf format string, where percent sequences have meaning.'],
 ["Read Without Interpreting Backslashes",'while IFS= read ____ line; do\n  printf "%s\\n" "$line"\ndone < file.txt','-r',null,'read -r keeps backslashes literal rather than treating them as escape characters.']
]);
pack('Bash',5,[
 ["Negation Changes the Status You Capture",'if ! false; then\n  echo "$?"\nfi','0',['1','127','Empty line'],'The status in the branch is that of the negated command, which succeeded. Capture the original status without ! if needed.'],
 ["Capture PIPESTATUS Before Another Command",'false | true\nstatuses=("${PIPESTATUS[@]}")\nprintf "%s " "${statuses[@]}"','1 0',['0 0','1 1','0 1'],'PIPESTATUS contains each pipeline element’s status. Subsequent commands replace it, so capture it immediately.'],
 ["Untrusted Text and eval",'eval "$user_input"','Parses and executes the input as shell code',['Only prints the text','Automatically escapes special characters','Limits input to assignments'],'eval introduces another shell parsing step. Prefer a fixed command with separately quoted arguments.'],
 ["Keep NUL-Delimited Paths Intact",'find . -type f -print0 | while IFS= read -r -d \'\' file; do\n  printf "%s\\n" "$file"\ndone','Handles embedded newlines in input path names',['Splits paths at every newline','Reads only the first file','Requires paths without spaces'],'find emits NUL delimiters; Bash read -d an empty delimiter uses NUL. Unix paths cannot contain NUL.'],
 ["Exporting Does Not Change the Parent Shell",'# Parent launches: bash child.sh\n# child.sh:\nexport MODE=test','Affects the child and its descendants, not the launching parent',['Mutates the parent’s MODE','Changes every logged-in shell','Writes the value into .bashrc'],'Environment inheritance flows from parent to child, not back from child to parent.']
]);
pack('SQL',1,[
 ["Select Every Column",'SELECT ____ FROM developers;','*',null,'* selects all columns in the result from this table.'],
 ["Sort Descending",'SELECT score FROM results ORDER BY score ____;','DESC',null,'DESC requests descending sort order. PostgreSQL places NULLs first by default for DESC.'],
 ["Exclude Duplicate Values",'SELECT ____ team_id FROM developers;','DISTINCT',null,'DISTINCT removes duplicate result rows.']
]);
pack('SQL',2,[
 ["Limit Result Rows",'SELECT name FROM developers ORDER BY name LIMIT 3;','Returns at most three rows',['Always returns exactly three','Returns every third row','Skips the first three rows'],'LIMIT caps the row count; fewer rows can exist.'],
 ["Join Matching Keys",'SELECT d.name, t.name\nFROM developers d\nJOIN teams t ____ d.team_id = t.id;','ON',null,'ON specifies the join condition relating the two tables.'],
 ['Substitute for NULL','SELECT COALESCE(NULL, 7, 9);','7',['NULL','9','0'],'COALESCE returns the first non-NULL argument.']
]);
pack('SQL',3,[
 ["A Filter Can Undo a Left Join",'SELECT d.id, t.name\nFROM developers d LEFT JOIN teams t ON t.id = d.team_id\nWHERE t.active = true;','Unmatched developers are filtered out',['Every developer is retained','Only unmatched developers remain','LEFT JOIN is a syntax error'],'The WHERE condition excludes NULL-extended rows. Put the condition in ON if unmatched left rows should remain.'],
 ["NULL Poisons a NOT IN Test",'SELECT 1 WHERE 3 NOT IN (1, NULL);','Returns no rows',['Returns 1','Throws a constraint error','Returns NULL as a row'],'No equality match plus a NULL comparison leaves the predicate unknown, which WHERE excludes.'],
 ["Partition a Window",'SELECT team_id, score,\n  ROW_NUMBER() OVER (____ BY team_id ORDER BY score DESC)\nFROM results;','PARTITION',null,'PARTITION BY restarts the window calculation for each team without collapsing rows.'],
 ["Use Bound Parameters",'-- User input is appended directly:\n"SELECT * FROM users WHERE name = \'" + input + "\'"','Use a parameterized query with a bound value',['Escape only spaces','Uppercase all input','Add LIMIT 1'],'Bound values prevent data from becoming query syntax; identifiers require separate handling.'],
 ["Keep Grouped and Windowed Results Distinct",'SELECT team_id, COUNT(*) FROM developers GROUP BY team_id;','Returns one row per distinct team_id group',['Returns one row per developer','Never includes a NULL team_id group','COUNT sorts the output'],'GROUP BY collapses input rows into groups, unlike window functions.']
]);
pack('SQL',4,[
 ["Index-Friendly Timestamp Ranges",'-- created_at has a B-tree index.\nWHERE created_at >= TIMESTAMP \'2026-01-01\'\n  AND created_at < TIMESTAMP \'2026-01-02\'','Can use a range scan on the plain timestamp index',['Always requires a full scan','Equivalent to equality for every timestamp','Requires an expression index on DATE(created_at)'],'A direct range condition can use the ordinary index; applying a function to the column may require a matching expression index.'],
 ["UNION Versus UNION ALL",'SELECT 1 UNION ALL SELECT 1;','Two rows containing 1',['One row containing 1','Two rows containing 2','A syntax error'],'UNION ALL retains duplicates; UNION removes them.'],
 ["Default Ordered Window Frames Include Peers",'-- scores are 10, 10, 20.\nSELECT score, SUM(score) OVER (ORDER BY score) FROM results;','The two score-10 rows each have a sum of 20',['The sums must be 10, 20, 40','All sums are 40','Window SUM removes duplicate rows'],'The default RANGE frame includes all peers through the current ordering value. Use an explicit ROWS frame and tie-breaker for row-by-row behavior.'],
 ["A Unique Constraint and NULL",'CREATE TABLE t (code text UNIQUE);\nINSERT INTO t VALUES (NULL), (NULL);','Allowed with the default unique-constraint NULL behavior',['Always rejected','Converts both to empty strings','Keeps only one row'],'By default PostgreSQL treats NULLs as distinct for uniqueness; NULLS NOT DISTINCT changes that behavior.'],
 ["OFFSET Grows More Costly",'SELECT * FROM events ORDER BY id LIMIT 20 OFFSET 1000000;','Typically must skip many rows; keyset pagination can help',['OFFSET jumps directly to any logical row for free','LIMIT always bounds examined rows to 20','OFFSET creates an index automatically'],'A large offset still requires locating and skipping preceding rows. A seek predicate on an indexed unique order can reduce work.']
]);
pack('SQL',5,[
 ["Read Committed Uses Statement Snapshots",'-- In one READ COMMITTED transaction:\nSELECT balance FROM accounts WHERE id = 1;\n-- Another transaction commits a change here.\nSELECT balance FROM accounts WHERE id = 1;','The two SELECTs can see different committed values',['Both must see the original value','The second always blocks forever','The first SELECT locks every row until commit'],'PostgreSQL Read Committed gives each statement a new snapshot.'],
 ["Serializable Transactions May Need Retry",'-- PostgreSQL reports SQLSTATE 40001.\n-- The application wants to preserve serializable behavior.','Retry the entire transaction with suitable retry control',['Retry only the last SELECT unconditionally','Ignore the error and commit','Disable all constraints'],'A serialization failure means the transaction cannot complete as attempted. Retry from the start with correct application logic.'],
 ["A Row Lock Ends With the Transaction",'BEGIN;\nSELECT * FROM jobs WHERE id = 1 FOR UPDATE;\nCOMMIT;','The row lock is released at transaction end',['The lock is permanent','The lock ends immediately after SELECT','Only table deletion releases it'],'FOR UPDATE locks selected rows against conflicting operations until the transaction ends.'],
 ["Recursive CTE Termination",'WITH RECURSIVE n(x) AS (\n  VALUES (1)\n  UNION ALL SELECT x + 1 FROM n WHERE x < 3\n) SELECT x FROM n;','Rows contain 1, 2, and 3',['Only 1','Infinite recursion','Rows contain 0, 1, 2'],'The anchor starts at 1; recursion emits the next value only while the prior value is below 3. Output order is not guaranteed without ORDER BY.'],
 ["Explain Analyze Executes the Query",'EXPLAIN ANALYZE DELETE FROM events WHERE archived = true;','Actually executes the DELETE while collecting execution statistics',['Only estimates without deleting','Automatically rolls back every DELETE','Only validates the SQL syntax'],'ANALYZE runs the statement. Use a suitable transaction and rollback if evaluating a modifying statement without keeping its effects.']
]);
pack('Assembly',1,[
 ["Subtract From a Register",'mov eax, 9\nsub eax, 4','EAX is 5',['EAX is 13','EAX is 4','EAX is 9'],'sub subtracts the source from the destination in Intel syntax.'],
 ["Copy Between Registers",'mov eax, 7\nmov ebx, eax','EBX is 7',['EAX becomes zero','EBX is an address','EBX is unchanged'],'A register-to-register mov copies the value without modifying the source.'],
 ["Push a 64-Bit Register",'push rax','RSP decreases by 8 and the value is stored on the stack',['RSP increases by 8','RAX is cleared','The stack grows by one byte'],'In 64-bit mode this push stores eight bytes and moves the stack pointer downward.']
]);
pack('Assembly',2,[
 ["Branch on Equal Comparison",'cmp eax, ebx\n____ equal_label','je',null,'je branches when the zero flag from cmp indicates equality.'],
 ["Zero-Extend an unsigned Byte",'____ eax, byte [rdi]','movzx',null,'movzx loads the byte and fills the destination’s upper bits with zero.'],
 ["Pop Restores a Stack Value",'push rax\npop rbx','RBX receives the pushed value and RSP is restored',['RAX becomes zero','RSP decreases by 16','RBX receives the stack address'],'pop reads the stack value and advances the stack pointer.']
]);
pack('Assembly',3,[
 ["Signed and unsigned Branches Differ",'cmp eax, ebx\n; EAX and EBX represent unsigned values.\n____ below_label','jb',null,'jb checks unsigned below using the carry flag. jl uses signed comparison.'],
 ["Zero a Register’S Upper Half",'mov rax, -1\nmov eax, 1','RAX becomes 1',['RAX is 0xffffffff00000001','RAX remains -1','RAX becomes 0'],'Writing EAX zeroes the high 32 bits of RAX in x86-64.'],
 ["Address Arithmetic Without a Load",'lea rax, [rdi + rsi*4]','Computes RDI + 4*RSI without reading that memory',['Loads four bytes from memory','Multiplies RDI by four','Dereferences RSI first'],'lea calculates the effective address; brackets do not make lea a memory load.'],
 ["Signed Division Setup",'; Signed 64-bit dividend currently in RAX.\n____\nidiv rbx','cqo',null,'cqo sign-extends RAX into RDX:RAX before signed 64-bit division.'],
 ["System V Integer Arguments",'; A normal System V AMD64 function receives its first integer argument.','RDI',['RCX','RAX','R10'],'The first six integer-class arguments normally use RDI, RSI, RDX, RCX, R8, R9.']
]);
pack('Assembly',4,[
 ["INC Preserves Carry",'stc\nmov eax, 0\ninc eax','CF stays set',['CF is cleared','CF becomes undefined','EAX stays zero'],'inc updates several arithmetic flags but does not update carry.'],
 ["Partial-Register Writes",'mov rax, 0x1234\nmov al, 0xff','RAX becomes 0x12ff',['RAX becomes 0xff','RAX becomes 0xffff','RAX stays 0x1234'],'An 8-bit AL write preserves the rest of RAX, unlike a 32-bit EAX write.'],
 ["Prepare Stack Alignment for a Call",'; System V AMD64: RSP is 16-byte aligned just before CALL.\n; CALL pushes an 8-byte return address.','On callee entry, RSP modulo 16 is 8',['RSP stays 16-byte aligned on entry','CALL pushes 16 bytes','RSP modulo 16 is 0 on every instruction'],'The return-address push changes the stack alignment observed by the callee.'],
 ["A Shift Does Not Imply a Multiply for signed Overflow Reasoning",'mov eax, 0x40000000\nshl eax, 1','EAX becomes 0x80000000',['EAX remains 0x40000000','The processor throws a signed-overflow exception','EAX becomes zero'],'The hardware shifts the bits; arithmetic flags report effects but ordinary integer overflow does not trap here.'],
 ["A Memory Operand Needs a Size When Ambiguous",'; NASM Intel syntax; no register supplies operand size.\nmov ____ [rdi], 1','byte',null,'An explicit size specifies a one-byte store. A bare immediate-to-memory instruction needs a chosen operand width.']
]);
pack('Assembly',5,[
 ["Linux Syscall Arguments Differ From Function Arguments",'; Linux x86-64 syscall ABI: fourth argument goes in which register?','R10',['RCX','RDI','RAX'],'syscall uses RCX for control-flow state, so Linux passes the fourth syscall argument in R10.'],
 ["Caller-Saved Registers Across a Call",'mov r10, 42\ncall external_function\n; Can we rely on R10 still being 42?','No; R10 is caller-saved in System V AMD64',['Yes; all registers are preserved','Yes; integers cannot change','No; CALL always zeroes R10'],'A caller must preserve live values in caller-saved registers if needed after a function call.'],
 ["Atomic Increment Needs Atomicity",'; Shared memory is accessed by multiple threads.\ninc qword [rdi]','Not an atomic read-modify-write without suitable synchronization',['Every aligned inc is automatically atomic','A volatile pointer makes it atomic','Only the carry flag can race'],'A lock-prefixed suitable instruction can provide atomic read-modify-write on shared memory. Alignment alone is insufficient.'],
 ["System V User-Space Red Zone",'; A leaf function needs 64 bytes of scratch space below RSP.\n; System V AMD64 user-space ABI, no further calls.','May use the 128-byte red zone without adjusting RSP',['The red zone is 8 bytes','All ABIs guarantee the same red zone','Only kernel code may use it'],'The user-space System V ABI reserves 128 bytes below RSP against signal-handler clobbering. Do not assume this for kernel code or other ABIs.'],
 ["Do Not Confuse a Store With a Fence",'mov qword [ready], 1\n; Is this alone a portable language-level publication protocol?','No; language/compiler ordering and synchronization must also be correct',['Yes on every architecture and compiler','Yes if ready has any integer type','Yes if the instruction is written after a comment'],'Hardware instructions do not by themselves establish a correct high-level synchronization contract around compiler-generated accesses.']
]);
pack('Git',1,[
 ["Create a Local Commit",'git ____ -m "Explain the change"','commit',null,'commit records the staged snapshot in local history. It does not push it to a remote.'],
 ["Inspect Commit History",'git ____ --oneline','log',null,'log shows commit history; --oneline requests a compact format.'],
 ["Switch to an Existing Branch",'git ____ feature','switch',null,'switch changes the current branch. The branch must already exist unless you use a creation option.']
]);
pack('Git',2,[
 ["Fetch Without Integrating",'git fetch origin','Updates fetched remote-tracking information without merging into the current branch',['Always merges origin/main','Discards unstaged files','Creates a new local commit automatically'],'fetch obtains remote objects and updates configured refs; integration is a separate operation.'],
 ["Inspect the Staged Diff",'git diff ____','--staged',null,'--staged compares the index with HEAD; --cached is a synonym.'],
 ["Create and Switch to a Branch",'git switch ____ feature','-c',null,'-c creates the new branch and switches to it.']
]);
pack('Git',3,[
 ["Undo With a New History Entry",'git revert <commit>','Creates a new commit that reverses the selected changes',['Erases all descendants of the commit','Moves HEAD without a commit','Untracks every affected file'],'revert records an inverse change, which is useful for shared history. Conflicts can still occur.'],
 ["Apply One Commit’S Changes",'git cherry-pick <commit>','Applies the change as a new commit on the current branch',['Moves the source branch','Copies only the commit message','Always creates a merge commit'],'cherry-pick replays a commit’s patch and usually gives it a different identity.'],
 ["Ignore Does Not Untrack",'echo secrets.txt >> .gitignore\n# secrets.txt is already tracked.','The file remains tracked',['The file is deleted automatically','Old commits lose the file','The next push excludes all versions'],'Ignore rules affect untracked paths; they do not remove tracked content or history.'],
 ["Abort a Conflicted Merge",'git merge topic\n# Conflicts occur; abandon this merge.\ngit merge ____','--abort',null,'--abort attempts to restore the pre-merge state. Existing local edits can complicate recovery.'],
 ["Unstage Without Discarding Work",'git restore ____ file.txt','--staged',null,'--staged restores the index from HEAD by default while leaving working-tree contents alone.']
]);
pack('Git',4,[
 ["Rebase Rewrites Commit Identities",'git rebase main\n# Nonempty feature commits are replayed onto a changed base.','Replayed commits normally get new IDs',['All original IDs are guaranteed unchanged','Only branch names change','Rebase must create a merge commit'],'The parent is part of commit identity, so replaying onto another base changes IDs.'],
 ["Stash Untracked Work",'git stash push ____','-u',null,'-u includes untracked files; ignored files require a different option.'],
 ["Find the First Bad Commit",'git bisect start\ngit bisect bad\ngit bisect good <known-good>','Searches between good and bad revisions for a regression',['Always checks commits in chronological order','Rewrites every commit','Runs tests automatically without a test command'],'bisect narrows the search using your good/bad test results; bisect run can automate testing.'],
 ["Use a Detached HEAD Deliberately",'git switch --detach <commit>\n# You create a new commit here.','The commit is not automatically added to a named branch',['The commit cannot exist','The commit is immediately pushed','Every existing branch moves to it'],'Create a branch or tag to retain an easy reference before leaving detached work.'],
 ["Understand the Two-Dot Log Range",'git log A..B','Commits reachable from B but not from A',['Commits reachable from either side only','Only the common ancestors','Only direct children of A'],'The two-dot revision range excludes the left side’s reachable history from the right side’s history.']
]);
pack('Git',5,[
 ["Protect a Force Push With a Lease",'git push --force-with-lease origin feature','Rejects the update if the remote ref differs from the lease’s expected value',['Never rewrites history','Locks the remote permanently','Guarantees no work can be lost under any background fetch'],'The lease checks an expected ref value. An implicit remote-tracking expectation can be changed by a background fetch; an explicit expected value is stronger.'],
 ["Recover Using a Reflog",'git reflog\n# A branch was moved locally by mistake.','May reveal a previous local ref target for recovery',['Is a permanent off-device backup','Records every other developer’s local actions','Cannot contain detached HEAD moves'],'Reflogs record local ref movements, but entries expire and unreachable objects can eventually be pruned.'],
 ["Choose a Mainline When Reverting a Merge",'git revert -m 1 <merge-commit>','Uses parent 1 as the mainline for computing the inverse change',['Deletes parent 1','Reverts the first commit in the repository','Only renames the merge commit'],'A merge has multiple parents. The mainline parent defines which side’s perspective determines the change to reverse.'],
 ["Three-Dot Log Is a Symmetric Difference",'git log A...B','Commits reachable from either side but not both',['All shared ancestors only','Identical to A..B in every graph','Only the merge-base commit'],'Three-dot revision selection excludes commits reachable from both histories. This differs from git diff A...B semantics.'],
 ["Skip an Untestable Bisect Revision",'git bisect run ./test-regression.sh\n# Which script exit code means this revision cannot be tested?','125',['0','1','128'],'For bisect run, 125 means skip. Zero means good; ordinary failure statuses below 128 except 125 mean bad.']
]);
pack('Docker',1,[
 ["Choose a Base Image",'____ python:3.12-slim','FROM',null,'FROM selects the base image for a build stage.'],
 ["Build From the Current Context",'docker ____ -t my-app .','build',null,'build builds an image; the dot supplies the current directory as its context.'],
 ["Set the Working Directory",'____ /app\nCOPY app.py .','WORKDIR',null,'WORKDIR sets the working directory for following relevant Dockerfile instructions.']
]);
pack('Docker',2,[
 ["RUN Happens During Build",'RUN python -m pip install -r requirements.txt','Executes while building the image',['Executes every time a container starts','Only sets metadata','Starts the host’s Python forever'],'RUN creates build-stage filesystem changes; CMD supplies a default runtime command.'],
 ["Run a Container in the Background",'docker run ____ my-app','-d',null,'-d starts the container in detached mode.'],
 ["Ignore Files in the Build Context",'# Which file contains build-context exclusion rules?','.dockerignore',['.gitignore only','Dockerfile.ignore','docker.conf'],'Docker reads .dockerignore to exclude matching context paths from the build input.']
]);
pack('Docker',3,[
 ["Compose Service Definitions",'# compose.yaml\n____:\n  web:\n    image: nginx','services',null,'services is the top-level mapping of application service definitions.'],
 ["Inspect Container Output",'docker ____ web','logs',null,'logs reads stdout and stderr captured for the container, subject to its logging configuration.'],
 ["Use a Named Volume",'docker run -v app-data:/data my-app','Mounts a named volume at /data',['Copies /data into the image','Binds ./app-data automatically','Sets a container environment variable'],'A non-path source here names a managed volume rather than a host directory.'],
 ["Container Stop Signals and Exec Form",'ENTRYPOINT ["python", "app.py"]','Starts Python directly rather than through the default command shell',['Starts bash automatically','Guarantees the app handles every signal correctly','Runs only during build'],'Exec form avoids an implicit shell wrapper. The application still needs correct signal handling.'],
 ["Image Versus Writable Container Layer",'docker run --name test my-app\n# test changes /tmp/result.txt, then is removed.','The change disappears with the container unless stored elsewhere',['The original image is automatically modified','Every new container inherits the change','The file is automatically a named volume'],'Ordinary writable-layer changes belong to that container; durable data needs appropriate storage.']
]);
pack('Docker',4,[
 ["Copy Artifacts From Another Stage",'FROM build-image AS builder\n# build creates /out/app\nFROM runtime-image\nCOPY ____ /out/app /app','--from=builder',null,'Multi-stage COPY transfers selected artifacts without copying the whole build-stage filesystem.'],
 ["Cache Dependencies Before Source Files",'COPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .','Allows dependency layers to stay cached when only app source changes',['Disables all caching','Always installs dependencies after every source edit','Prevents app code from reaching the image'],'Put less frequently changing dependency inputs before frequently changing source files to improve cache reuse.'],
 ["Avoid Secrets in Build Arguments",'ARG API_TOKEN\nRUN echo "$API_TOKEN" > /token','Build arguments are unsuitable for secrets; use a build secret mount',['ARG makes the token encrypted forever','Deleting /token later guarantees removal from all layers','The token never reaches a build command'],'Secret-bearing build inputs or artifacts may leak into metadata or layers. A secret mount avoids baking the input into a layer when used correctly.'],
 ["A HEALTHCHECK Does Not Imply Restart",'HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1\n# Health status becomes unhealthy under plain docker run.','Health status alone does not automatically restart the container',['Docker always restarts it immediately','The image is rebuilt','All network ports are closed'],'Health status is a signal. Recovery behavior depends on the runtime or orchestration policy.'],
 ["Runtime Arguments Replace CMD",'ENTRYPOINT ["python"]\nCMD ["app.py"]\n# docker run image other.py','Runs python other.py',['Runs other.py without Python','Runs both scripts','Always ignores other.py'],'With exec-form ENTRYPOINT, supplied runtime arguments replace the default CMD arguments.']
]);
pack('Docker',5,[
 ["Removing a Secret in a Later Layer",'COPY secret.txt /secret.txt\nRUN rm /secret.txt','The earlier layer can still contain the secret',['Deletion securely overwrites every lower layer','The build context never contained the file','Only the final filesystem exists in the image archive'],'Layers retain earlier filesystem differences. Avoid copying secrets into the image at all.'],
 ["Mount a BuildKit Secret Temporarily",'RUN --mount=type=secret,id=token cat /run/secrets/token >/dev/null','The secret is mounted for that RUN; the mount itself is not committed as a layer file',['The secret is permanently copied into the final image','The secret is an ordinary ARG','No build command can read the secret'],'BuildKit secret mounts provide temporary inputs; explicitly writing the secret elsewhere can still leak it.'],
 ["Multi-Platform Manifests",'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry/app:tag .','Builds platform variants and publishes a multi-platform result',['Converts one x86 binary into ARM code automatically','Guarantees every Dockerfile is cross-platform','Only builds for the host platform'],'Each target platform needs compatible build output. Emulation or cross-compilation may be needed.'],
 ["Restart Policy Is Not Readiness",'docker run --restart unless-stopped my-app','Configures restart behavior, not dependency readiness',['Waits for every dependent database to be ready','Prevents all restarts after any failure','Creates a readiness probe automatically'],'Restart policy and application readiness are different concerns; applications need suitable startup and retry behavior.'],
 ["Bind Mounts Hide Image Contents",'COPY defaults/ /app/config/\n# At runtime: -v /host/config:/app/config','The mounted directory obscures the image’s files at that path',['Docker merges both directories by filename','The host directory is overwritten by COPY at startup','The image is permanently changed'],'A bind mount presents its source at the target path and hides existing image files there for that container.']
]);
pack('Terraform',1,[
 ["Initialize the Working Directory",'terraform ____','init',null,'init prepares the working directory, including providers, modules, and backend configuration.'],
 ["Declare a String Input",'variable "region" {\n  type = ____\n}','string',null,'string is the primitive type constraint for text input.'],
 ["Format HCL Files",'terraform ____','fmt',null,'fmt rewrites Terraform configuration into its canonical format. It does not apply infrastructure changes.']
]);
pack('Terraform',2,[
 ["Read a Local Value",'locals { name = "web" }\noutput "name" { value = ____ }','local.name',null,'Locals are referenced through the singular local namespace.'],
 ["Validate the Configuration",'terraform ____','validate',null,'validate checks configuration validity in an initialized directory. It does not prove a cloud deployment will succeed.'],
 ["Output a Resource Attribute",'output "vpc_id" {\n  value = aws_vpc.main.id\n}','Exposes the VPC ID as an output',['Creates another VPC','Makes the ID a literal string','Removes the VPC from state'],'An output exposes a computed value; the expression also establishes a dependency.']
]);
pack('Terraform',3,[
 ["Iterate With Stable Keys",'resource "aws_s3_bucket" "b" {\n  for_each = toset(["logs", "reports"])\n  bucket = "example-${each.key}"\n}','Instances are addressed by the keys logs and reports',['Instances are addressed only by numeric indices','Creates one bucket with two names','each.key is unavailable'],'for_each addresses resource instances by map keys or set members. Use real globally unique bucket names in a real deployment.'],
 ["Create an Explicit Dependency",'resource "example_service" "app" {\n  ____ = [example_policy.ready]\n}','depends_on',null,'depends_on expresses a dependency not already captured by ordinary value references.'],
 ["Use a Conditional Expression",'locals { size = var.prod ? "large" : "small" }\n# var.prod is false.','small',['large','false','Syntax error'],'Terraform conditionals select the first result when true, otherwise the second.'],
 ["Plan Before Applying",'terraform plan -out=review.tfplan\nterraform apply review.tfplan','Applies the saved plan, subject to state and execution validity',['Always replans unrelated changes first','Applies only the text in the filename','The saved plan is documentation only'],'A saved plan records the proposed actions. Treat plan files as sensitive and review them before applying.'],
 ["Read a Module Output",'module "network" { source = "./network" }\n# The child module declares output "vpc_id".\noutput "id" { value = ____ }','module.network.vpc_id',null,'A module’s declared outputs are accessed by module name and output name.']
]);
pack('Terraform',4,[
 ["Sensitive Is Not Encrypted State",'variable "password" {\n  type = string\n  sensitive = true\n}','Redacts normal display, but does not by itself encrypt stored state',['Removes the value from state automatically','Encrypts all provider storage','Prevents the value reaching any provider'],'sensitive controls presentation and propagation. Protect the state backend and handle secrets appropriately.'],
 ["Resource Identity Under Count",'count = length(var.names)\nname = var.names[count.index]\n# Remove the first name from the list.','Later indices can shift, changing which object an address represents',['All addresses use the name as a stable key','Only the last name can ever be affected','count makes list reordering irrelevant'],'count uses numeric indices; for_each keyed by stable identities often avoids these shifts.'],
 ["Move a Resource Address Explicitly",'moved {\n  from = aws_instance.old\n  to   = aws_instance.new\n}','Describes an address move so renaming need not recreate the object',['Copies the instance into two resources','Always destroys the old object first','Only changes an output name'],'A moved block records a refactor in resource addressing, subject to type and move compatibility.'],
 ["A prevent_destroy Guard",'lifecycle { prevent_destroy = true }','Rejects a planned destruction while that configuration is present',['Makes cloud deletion impossible','Protects even after the resource block is removed','Encrypts the resource'],'prevent_destroy is a Terraform planning guard, not an external deletion lock; removing configuration removes that guard.'],
 ["Backend State Locking",'// Two operators apply against the same shared state.\n// The configured backend supports locking.','Locking prevents simultaneous writers, not faulty changes or external drift',['Locking validates application behavior','Locking prevents every external cloud edit','Locking eliminates the need for reviews'],'State locking coordinates writers. It is one part of consistent operation, not a correctness proof.']
]);
pack('Terraform',5,[
 ["for_each Keys Must Be Known",'for_each = toset([aws_instance.new.id])\n# new.id is unknown until apply.','The unknown instance key prevents planning this for_each',['Terraform invents a stable key automatically','An unknown value is treated as an empty set','All resource attributes must always be known'],'Terraform needs instance keys at planning time. A map with known keys and unknown values can be suitable.'],
 ["Lifecycle Ordering With Unique Names",'lifecycle { create_before_destroy = true }\n# The replacement and existing object must have the same globally unique name.','The naming constraint may prevent creating both simultaneously',['Terraform bypasses provider uniqueness rules','The name becomes optional','Terraform secretly deletes first regardless of the setting'],'Creation-before-destruction needs coexistence to be possible, including provider naming and dependency constraints.'],
 ["Targeted Plans Omit Unrelated Work",'terraform plan -target=aws_instance.app','Narrows the graph; it is not a substitute for reviewing a full plan',['Always includes all configuration changes','Automatically proves no dependencies exist','Targets cloud resources by their display name'],'Targeting includes relevant dependencies but can leave other changes unapplied. Use it for exceptional recovery situations.'],
 ["Provider Values Can Be Unknown in a Plan",'resource "aws_instance" "app" { /* configured fields omitted */ }\noutput "id" { value = aws_instance.app.id }','The ID can be unknown until the provider creates the resource',['Every output must be a known literal','An unknown output is always an error','Terraform must predict the provider’s generated ID'],'Computed provider attributes can legitimately remain unknown during planning and resolve during apply.'],
 ["Drift Versus Configuration Changes",'// A remote resource changed outside Terraform.\n// A normal plan refreshes its current state before comparing desired configuration.','The plan can propose changes to reconcile the drift',['External drift is never visible','The configuration file is rewritten automatically','A refresh always deletes changed resources'],'Refresh reads current remote information; the desired configuration determines proposed reconciliation. Review rather than assuming every change is intentional.']
]);
pack('Kubernetes',1,[
 ['List Pods','kubectl get ____','pods',null,'get pods lists Pod resources in the current namespace unless another namespace is requested.'],
 ["Set a Resource Name",'metadata:\n  ____: web','name',null,'metadata.name identifies the object within its resource scope.'],
 ["Declare a Container Image",'containers:\n  - name: web\n    ____: nginx:1.27','image',null,'image supplies the container image reference. This is a manifest syntax example, not a version recommendation.']
]);
pack('Kubernetes',2,[
 ["Set Replica Count",'kind: Deployment\nspec:\n  ____: 3\n  # remaining fields omitted','replicas',null,'replicas expresses the desired number of Deployment Pods.'],
 ["Choose a Namespace",'kubectl get pods ____ training','-n',null,'-n selects a namespace for this request without changing the stored context.'],
 ["Read a Pod’S Logs",'kubectl ____ web-pod','logs',null,'logs reads a container’s output. Multi-container Pods may require -c to choose the container.']
]);
pack('Kubernetes',3,[
 ["Readiness Versus Liveness",'readinessProbe:\n  httpGet:\n    path: /ready\n    port: 8080','Controls readiness for traffic; a failure does not itself restart the container',['Restarts the container on every failure','Sets replica count','Disables the scheduler'],'Readiness affects endpoint readiness. Liveness failures can trigger restarts under the relevant policy.'],
 ["Use a ConfigMap Key as an Environment Value",'env:\n  - name: MODE\n    valueFrom:\n      ____:\n        name: app-config\n        key: mode','configMapKeyRef',null,'configMapKeyRef selects a value from a named ConfigMap.'],
 ["Resource Requests Inform Scheduling",'resources:\n  requests:\n    cpu: "250m"\n    memory: "128Mi"','Declares scheduling requests; this is not the same as resource limits',['Sets both hard limits implicitly','Uses 250 whole CPUs','Requests are ignored by the scheduler'],'The scheduler considers requests against available node capacity. Limits are separate fields.'],
 ["Service Selectors Use Pod Labels",'kind: Service\nspec:\n  selector:\n    app: web','Selects Pods with matching labels in the Service’s namespace',['Selects Deployments by name','Selects nodes named web','Selects every namespace by default'],'Ordinary Service selectors match Pod labels; a Deployment name is not the matching criterion.'],
 ["Choose a Rollout Command",'kubectl rollout ____ deployment/web','status',null,'rollout status observes progress of the Deployment’s rollout.']
]);
pack('Kubernetes',4,[
 ["A Secret’S Base64 Is Not Encryption",'kind: Secret\ndata:\n  token: c2VjcmV0','The value is base64-encoded, not encrypted by this field',['The field guarantees encryption at rest','Only the creating Pod can decode it','Base64 makes it irreversible'],'Protect Secrets with access control and appropriate at-rest encryption. Encoding alone does not provide confidentiality.'],
 ["Rolling Update Capacity",'strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1\n    maxUnavailable: 0','May create an extra Pod while keeping desired availability',['Must delete every old Pod first','Always requires exactly zero extra capacity','Changes the desired replica count permanently'],'The rollout may need room for a surge Pod, and progress depends on new Pods becoming available.'],
 ["Avoid Premature Liveness Restarts",'startupProbe:\n  httpGet: {path: /startup, port: 8080}\n  failureThreshold: 30\n  periodSeconds: 10','Delays other configured probe types until startup succeeds',['Replaces readiness permanently','Makes liveness failures impossible forever','Runs only after readiness fails'],'A startup probe gives a slow-starting container time before liveness/readiness probes operate normally.'],
 ["A Deployment Is Not a StatefulSet",'// An app needs stable Pod identities and per-Pod persistent volume claims.','Consider a StatefulSet for these requirements',['A Deployment always provides ordinal Pod names','A Service creates disk claims','A ConfigMap preserves Pod identity'],'StatefulSet provides stable identities and storage association; persistence still depends on the configured storage and policy.'],
 ["NetworkPolicy Requires Implementation Support",'kind: NetworkPolicy\n# Valid policy selects the app Pods.','Traffic enforcement depends on the cluster networking implementation supporting NetworkPolicy',['The YAML alone guarantees enforcement in every cluster','Only Service type changes enforce it','NetworkPolicy is a Pod resource request'],'An API object is insufficient without a networking implementation that enforces the policy.']
]);
pack('Kubernetes',5,[
 ["A PDB Is Not a Universal Availability Shield",'kind: PodDisruptionBudget\nspec:\n  minAvailable: 2\n  selector: {matchLabels: {app: web}}','Constrains supported voluntary evictions, not every outage or deletion',['Prevents every node failure','Guarantees application-level availability','Prevents direct Pod deletion in all cases'],'PDBs guide voluntary disruption through the eviction API; involuntary failures and other actions can still disrupt service.'],
 ["Projected Secret Updates Versus Environment Values",'// A Secret is updated after a Pod starts.\n// It is consumed once via an env value and also as an ordinary projected volume, not subPath.','The volume can update eventually; the existing process environment does not update automatically',['Both update the process environment instantly','Neither can ever change','The Pod is always restarted automatically'],'Projection can refresh files, while startup environment values stay unchanged. Applications must reread files as appropriate.'],
 ["RBAC Is Additive",'// A user has multiple RoleBindings.\n// One role omits a permission that another role grants.','The grant remains; RBAC has no deny rule to cancel it',['The narrower role denies the action','Last binding wins','Only the first role counts'],'Kubernetes RBAC combines allowed permissions additively.'],
 ["Jobs Need Idempotent Work",'// A Job may restart or replace a failing Pod.\n// Its task performs an external side effect.','Design for possible repeated execution; do not assume exactly-once side effects',['A Job guarantees the task runs exactly once','External actions are rolled back on Pod failure','Only CronJobs can repeat work'],'Retries and controller behavior can repeat attempts. Use idempotency, deduplication, or transactional coordination for side effects.'],
 ["HPA CPU Utilization Needs Requests",'// HPA uses CPU utilization as a percentage of requests.\n// Relevant container CPU requests are missing.','Utilization can be undefined and this metric cannot drive the expected scaling',['Missing requests mean 100 percent by definition','HPA sets arbitrary CPU requests automatically','Replica count always doubles'],'CPU utilization ratios require a request baseline. Configure requests and inspect metric availability and HPA conditions.']
]);
pack('Ansible',1,[
 ["Start a Tasks List",'- hosts: web\n  ____:\n    - name: Ping hosts\n      ansible.builtin.ping:','tasks',null,'tasks contains the ordered task list for the play.'],
 ["Run a Playbook",'____ -i inventory.ini site.yml','ansible-playbook',null,'ansible-playbook runs plays using the supplied inventory.'],
 ["Declare a Play Variable",'- hosts: web\n  vars:\n    port: 8080\n  tasks: []','Defines port for the play’s variable context',['Creates a host listening socket','Installs a package','Only changes the task name'],'vars declares values for task and template use; it does not itself change managed machines.']
]);
pack('Ansible',2,[
 ["Interpolate a Variable",'dest: "/opt/{{ ____ }}/app.conf"\n# app_name is a defined variable.','app_name',null,'Jinja expressions inside {{ ... }} substitute variable values.'],
 ["Loop Over Values",'- name: Show items\n  ansible.builtin.debug:\n    msg: "{{ item }}"\n  ____: [one, two]','loop',null,'loop repeats the task for each item; item is the default loop variable.'],
 ["Run a Task Conditionally",'- name: Run only in production\n  ansible.builtin.debug:\n    msg: production\n  ____: environment == "prod"','when',null,'when evaluates a conditional expression without needing surrounding Jinja braces.']
]);
pack('Ansible',3,[
 ["Capture a Task Result",'- name: Run health check\n  ansible.builtin.command: /opt/app/check\n  ____: check_result','register',null,'register stores the task result for subsequent expressions such as check_result.rc.'],
 ["Prefer Desired State to Repeated Append",'- name: Ensure a setting\n  ansible.builtin.lineinfile:\n    path: /tmp/app.conf\n    line: mode=prod','Expresses a desired line state rather than blindly appending it every run',['Always adds a new duplicate line','Only reads the file','Requires shell redirection'],'A suitable state-aware module can avoid repeated side effects and improve idempotency.'],
 ["Copy a Template With Substitutions",'- name: Render configuration\n  ____:\n    src: app.conf.j2\n    dest: /tmp/app.conf','ansible.builtin.template',null,'template renders Jinja content before placing the resulting file on the managed host.'],
 ["Gathered Facts Are Host-Specific",'ansible_facts["distribution"]','Reads a gathered fact about the managed host',['Always identifies the controller OS','Automatically installs the distribution','Reads a command-line option'],'Facts describe managed hosts when gathered or explicitly supplied.'],
 ["Check Mode Is Predictive and Module-Dependent",'ansible-playbook site.yml --check','Simulates supported changes; not every task can provide a complete prediction',['Guarantees every command is safely simulated','Always applies changes','Only validates YAML syntax'],'Check-mode support varies by module and task design. Registered results may also differ from a normal run.']
]);
pack('Ansible',4,[
 ["Define a Custom Change Condition",'- ansible.builtin.command: /opt/app/check\n  register: result\n  ____: false','changed_when',null,'changed_when controls reported change status, which affects reporting and notifications.'],
 ["Multiple failed_when Entries Are ANDed",'failed_when:\n  - result.rc != 0\n  - "\'fatal\' in result.stderr"','Fails only when both conditions are true',['Fails if either condition is true','Always fails','Evaluates only the last condition'],'A condition list is implicitly ANDed. Use a single expression with or when either condition should fail the task.'],
 ["Handle Failure With a Rescue Block",'block:\n  - ansible.builtin.command: /opt/app/action\nrescue:\n  - ansible.builtin.debug: {msg: recovered}','Runs rescue after a task failure in the block, subject to Ansible failure semantics',['Rescue runs before every task','Rescue handles every unreachable host automatically','Rescue is a handler notification'],'Block rescue handles failed task results; unreachable hosts and invalid task definitions have different behavior.'],
 ["Serialize Host Batches",'- hosts: web\n  ____: 2\n  tasks: []','serial',null,'serial limits the active batch of hosts for the play. It differs from task concurrency controls.'],
 ["Delegate to a Different Execution Host",'- name: Update load balancer\n  ansible.builtin.command: /opt/lb/update\n  ____: localhost','delegate_to',null,'delegate_to executes this task on the chosen delegated host while retaining the original inventory host context in relevant ways.']
]);
pack('Ansible',5,[
 ["Flush Notified Handlers Early",'- ansible.builtin.meta: ____','flush_handlers',null,'flush_handlers runs handlers already notified at that point rather than waiting for the usual flush boundary.'],
 ["A Failed Host Can Skip Its Notified Handler",'// A task changes a config and notifies a restart handler.\n// A later task fails on that host before the normal handler flush.','The handler may not run on that host without appropriate force_handlers behavior',['Handlers always run regardless of failure','The changed file is automatically reverted','The notification restarts the service immediately'],'Handler timing and host failure can leave a changed file without its planned restart. Account for failure behavior deliberately.'],
 ["run_once and Serial Interact",'- hosts: web\n  serial: 2\n  tasks:\n    - ansible.builtin.command: /opt/action\n      run_once: true','Normally runs once per serial batch, not necessarily once for the entire play',['Always once globally across all batches','Runs on every host regardless of batching','Prevents serial from taking effect'],'run_once selects a host in the current batch. Use a deliberate condition or separate play for global one-time work.'],
 ["Vault Protects Storage, Not Every Runtime Disclosure",'// A variable is encrypted in an Ansible Vault file.\n- ansible.builtin.debug:\n    var: secret_value','The decrypted value can still be exposed by task output',['Vault automatically hides every debug output','Vault values can never be used by modules','Vault encrypts every target-host log'],'Vault encrypts stored content. Use careful task design and no_log where appropriate to avoid runtime disclosure.'],
 ["Explicit Variable Precedence",'ansible-playbook site.yml -e mode=prod\n# A play defines vars: {mode: dev}.','mode is prod under normal variable precedence',['mode is dev','The two values are concatenated','Ansible rejects every duplicate variable'],'Extra variables have very high variable precedence and override ordinary play vars.']
]);
pack('Podman',1,[
 ["List Running Containers",'podman ____','ps',null,'ps lists running containers by default; -a includes stopped containers.'],
 ["Build an Image",'podman ____ -t app .','build',null,'build uses the current directory as the context for the image build.'],
 ["Read Container Output",'podman ____ web','logs',null,'logs displays container output captured by its logging configuration.']
]);
pack('Podman',2,[
 ["Start in the Background",'podman run ____ docker.io/library/nginx','-d',null,'-d requests detached mode rather than attaching the foreground terminal.'],
 ["Remove After Exit",'podman run ____ docker.io/library/alpine echo hello','--rm',null,'--rm removes the container after it exits. It does not mean every persistent volume is deleted.'],
 ["Pull a Fully Qualified Image",'podman pull docker.io/library/alpine:3.20','Identifies registry, repository, and tag explicitly',['Names a running container','Builds the image from a local Dockerfile','Only accesses a local filesystem'],'A fully qualified reference avoids relying on short-name registry resolution. The version here is a syntax example.']
]);
pack('Podman',3,[
 ["Container State Belongs to the Container",'podman stop web\npodman start web','Restarts the same existing container rather than creating a new one',['Builds a new image','Deletes its writable layer first','Renames the container'],'start operates on an existing stopped container. run creates a new container.'],
 ["Use an Explicit Environment Value",'podman run ____ MODE=prod image','-e',null,'-e supplies an environment variable to the container process.'],
 ["A Pod Can Share a Network Namespace",'podman pod create --name demo\n# Containers join this pod with --pod demo.','Joined containers normally share the pod’s network namespace',['Every container must use a different loopback device','Joining a pod means joining Kubernetes','The pod shares every host namespace automatically'],'A Podman pod can share selected namespaces; network sharing lets its containers communicate via localhost.'],
 ["Inspect Structured Details",'podman ____ web','inspect',null,'inspect returns detailed structured information about the object.'],
 ["Mount a Named Volume",'podman run -v appdata:/data image','Uses a named volume at /data',['Treats appdata as a required absolute host path','Changes the image’s build context','Only mounts a single file'],'The source name identifies a managed volume rather than an absolute bind source.']
]);
pack('Podman',4,[
 ["Rootless Root Is Not Host Root",'// Local Linux Podman runs rootless in a user namespace.\n// The container process reports UID 0.','UID 0 inside does not automatically mean UID 0 on the host',['The process has all host-root privileges','User namespaces disable permissions entirely','UID mappings are impossible'],'Rootless user namespaces map container identities to permitted host identities. Container and host root are different here.'],
 ["SELinux Private Volume Relabeling",'podman run -v /srv/app:/app:Z image\n# SELinux-enabled local Linux host.','Requests a private container-specific label for the mount',['Makes the mount read-only','Compresses the volume','Disables all host SELinux enforcement'],'Z requests private relabeling; z is used for a shared label. Relabel only suitable host paths.'],
 ["Publish a Pod Port When Creating the Pod",'podman pod create --name webpod -p 8080:80','Publishes a port for the pod’s shared network',['Assigns port 8080 to every image tag','Requires a Service YAML file','Automatically starts an nginx container'],'For shared pod networking, arrange port publishing at pod creation rather than conflicting per-container publication.'],
 ["Restart Is Not Recreation",'podman restart web','Restarts the existing container using its existing configuration',['Uses any newly tagged image automatically','Rebuilds its image','Changes all volume mappings'],'Restart does not create a replacement container from a newly updated image.'],
 ["Preserve Caller Identity With Keep-Id",'podman run --userns=keep-id image\n# Local Linux rootless operation.','Maps the calling user’s UID/GID into the container with the same IDs',['Runs as host root','Disables the user namespace','Copies every host account password'],'keep-id helps preserve caller identity across the user namespace; filesystem ownership and image behavior still matter.']
]);
pack('Podman',5,[
 ["Rootless Containers Have User-Scoped Storage",'// Alice and Bob each use local Linux rootless Podman.\n// Alice creates a container named web.','Bob does not automatically see Alice’s container in his own podman ps',['All users share one rootless container database','The container becomes root-owned','The name web is global across every user by default'],'Rootless container storage and state are associated with the operating user. Rootful storage is separate too.'],
 ["Quadlet Declares Systemd-Managed Containers",'# app.container, installed in a supported Quadlet search path\n[Container]\nImage=registry.example/app:stable','Quadlet can generate a systemd service from this declarative container unit',['It is a Dockerfile','It is a Kubernetes Deployment','It runs only as a shell alias'],'Quadlet integrates container definitions with systemd unit generation. Configure supported fields and dependencies for the environment.'],
 ["Bind Mounts and Remote Podman",'podman --remote run -v /srv/data:/data image','The bind source is on the server side, not automatically the client filesystem',['Podman uploads every client path automatically','The mount always fails for remote use','The path is relative to the image registry'],'A remote engine uses its own filesystem for bind sources. VM-based environments may provide specific shared paths.'],
 ["Sharing an SELinux Label",'podman run -v /srv/shared:/data:z image\n# Another authorized container will share this path.','z requests a shared container label, unlike private Z',['z is equivalent to read-only ro','z permanently disables access controls','Z and z have identical sharing semantics'],'Shared versus private relabeling matters when multiple containers need access under SELinux.'],
 ["A Container Auto-Update Needs More Than a Mutable Tag",'// A systemd-managed container should update from a changed registry image.','Configure a supported auto-update policy and the corresponding service workflow',['A tag alone always restarts all containers','podman ps performs updates automatically','All bind mounts make auto-update impossible'],'Podman auto-update depends on a configured policy and restart integration; use the supported systemd or Quadlet workflow and test rollback behavior.']
]);

const CURRICULUM_REFS = {
  'pack-rust-5-1':'https://doc.rust-lang.org/std/pin/',
  'pack-rust-5-2':'https://doc.rust-lang.org/nomicon/send-and-sync.html',
  'pack-rust-5-3':'https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html',
  'pack-rust-5-4':'https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility',
  'pack-java-5-1':'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html',
  'pack-java-5-2':'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html',
  'pack-java-5-5':'https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html',
  'pack-sql-5-1':'https://www.postgresql.org/docs/current/transaction-iso.html',
  'pack-sql-5-2':'https://www.postgresql.org/docs/current/transaction-iso.html',
  'pack-sql-5-5':'https://www.postgresql.org/docs/current/sql-explain.html',
  'pack-git-5-1':'https://git-scm.com/docs/git-push',
  'pack-git-5-2':'https://git-scm.com/docs/git-reflog',
  'pack-git-5-3':'https://git-scm.com/docs/git-revert',
  'pack-git-5-4':'https://git-scm.com/docs/gitrevisions',
  'pack-git-5-5':'https://git-scm.com/docs/git-bisect',
  'pack-docker-3-1':'https://docs.docker.com/reference/compose-file/services/',
  'pack-docker-4-3':'https://docs.docker.com/build/building/secrets/',
  'pack-docker-5-2':'https://docs.docker.com/build/building/secrets/',
  'pack-docker-5-3':'https://docs.docker.com/build/building/multi-platform/',
  'pack-terraform-4-1':'https://developer.hashicorp.com/terraform/language/manage-sensitive-data',
  'pack-terraform-4-3':'https://developer.hashicorp.com/terraform/language/modules/develop/refactoring',
  'pack-terraform-4-4':'https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle',
  'pack-terraform-5-1':'https://developer.hashicorp.com/terraform/language/meta-arguments/for_each',
  'pack-terraform-5-2':'https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle',
  'pack-kubernetes-3-1':'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/',
  'pack-kubernetes-4-1':'https://kubernetes.io/docs/concepts/configuration/secret/',
  'pack-kubernetes-4-3':'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/',
  'pack-kubernetes-4-5':'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
  'pack-kubernetes-5-1':'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/',
  'pack-kubernetes-5-2':'https://kubernetes.io/docs/concepts/configuration/secret/',
  'pack-kubernetes-5-3':'https://kubernetes.io/docs/reference/access-authn-authz/rbac/',
  'pack-kubernetes-5-4':'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
  'pack-kubernetes-5-5':'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
  'pack-ansible-4-1':'https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_error_handling.html',
  'pack-ansible-4-2':'https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_error_handling.html',
  'pack-ansible-5-1':'https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_handlers.html',
  'pack-ansible-5-2':'https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_error_handling.html',
  'pack-ansible-5-3':'https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_strategies.html',
  'pack-podman-5-2':'https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html',
  'pack-podman-5-5':'https://docs.podman.io/en/latest/markdown/podman-auto-update.1.html'
};
for(const q of QUESTIONS) {
  if(CURRICULUM_REFS[q.id]) q.source = CURRICULUM_REFS[q.id];
  if(q.language === 'Docker' && q.type === 'Fill the Blank' && ['FROM','WORKDIR','COPY'].includes(q.answers[0])) q.answers.push(q.answers[0].toLowerCase());
}
