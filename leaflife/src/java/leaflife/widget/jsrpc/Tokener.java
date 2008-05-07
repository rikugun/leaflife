package leaflife.widget.jsrpc;

import java.io.EOFException;
import java.nio.BufferUnderflowException;
import java.nio.CharBuffer;
import java.util.regex.Pattern;

/**
 * A JSONTokener takes a source string and extracts characters and tokens from it. It is used by the JSON Serializers to parse JSON source strings.
 * @author huangchao
 */
public class Tokener
{
    // the token type
    public final static int START_OBJECT = 1;  // "{"
    public final static int END_OBJECT = 2;  // "}"
    public final static int START_ARRAY = 3;  // "["
    public final static int END_ARRAY = 4;  // "]"
    public final static int STRING = 5;  // string
    public final static int COMMA = 6;  // ","
    public final static int COLON = 7;  // ":"
    public final static int NULL = 8;  // null or undefined
    public final static int CHARACTERS = 9;  // characters
    private CharBuffer source;  // the JSON string being parsed
    private String token_text;  // the token text readed
    private static Pattern number_pattern = Pattern.compile("^[\\+\\-]?(\\d)*(\\.)?(\\d)+([eE][\\+\\-]?\\d+)?(\\d)*$");  // the regular expression to identify JSON Number object (eg. -0.387 or 4.5e-3)
    private static Pattern date_pattern = Pattern.compile("^@(\\d)+$");  // the regular expression to identify JSON Date object (eg. @129754737224)
//    private static Pattern obj_ref_pattern = Pattern.compile("^#(\\d)+$");  // the regular expression to identify JSON reference (eg. #2)
//    private transient static Logger logger = Logger.getLogger(JSONTokener.class.getName());

    /**
     * Constructor to build tokener
     * @param the JSON string to be parsed
     */
    public Tokener(CharBuffer source)
    {
        this.source = source;
        source.rewind();
        source.mark();
    }

    /**
     * Returns the JSON string being parsed
     * @return the JSON string being parsed
     */
    public CharBuffer getSource()
    {
        return source;
    }

    public String getClip()
    {
        source.reset();
        int pos = source.position();
        source.rewind();
        int last_idx = source.length() - 1;
        int start_idx = pos <= 16 ? 0 : pos - 16;
        int end_idx = pos + 16 >= last_idx ? last_idx : pos + 16;
        StringBuffer clip = new StringBuffer(source.subSequence(start_idx, end_idx).toString()).append("\n");
        for (int i = start_idx; i < pos; ++ i)
        {
            clip.append(" ");
        }
        clip.append("^");
        return clip.toString();
    }

    /**
     * Tests if there are more tokens available from this JSON string.
     * @return true if and only if there is at least one token in the JSON string after the current position; false otherwise.
     * @throws InvalidJSONSyntaxException if the syntax of JSON string is invalid
     */
    public boolean hasMoreToken() throws InvalidJSONSyntaxException
    {
        try
        {
            nextChar();
            source.position(source.position() - 1);
            return true;
        }
        catch (EOFException e)
        {
            return false;
        }
    }

    /**
     * Back to last token. So you can re-parse the token.
     */
    public void lastToken()
    {
        source.reset();
    }

    /**
     * Reads a valid character from JSON string. Ignore whitespace, carriage return and invisible character.
     * @return the character readed from current position
     * @throws EOFException if there is no valid character left
     * @throws InvalidJSONSyntaxException if the syntax of JSON string is invalid
     */
    private char nextChar() throws EOFException, InvalidJSONSyntaxException
    {
        try
        {
            while (true)
            {
                char c = source.get();
                if (c == '/')
                {
                    c = source.get();
                    switch (c)
                    {
                        case '/':  // ignore comment "//"
                        {
                            do
                            {
                                c = source.get();
                            }
                            while (c != '\n' && c != '\r');
                            break;
                        }
                        case '*':  // ignore comment "/*" and "*/"
                        {
                            try
                            {
                                while (true)
                                {
                                    if (source.get() == '*')
                                    {
                                        c = source.get();
                                        if (c == '/')
                                        {
                                            break;
                                        }
                                        else if (c == '*')
                                        {
                                            source.position(source.position() - 1);
                                        }
                                    }
                                }
                            }
                            catch (BufferUnderflowException e)
                            {
                                throw new InvalidJSONSyntaxException("104");  // unclosed comment
                            }
                        }
                    }
                }
                else if (c > ' ')  // ignore whitespace, carriage return and invisible character
                {
                    return c;
                }
            }
        }
        catch (BufferUnderflowException e)
        {
            throw new EOFException();
        }
    }

    /**
     * Reads specified number of characters from current position.
     * @param n the number of characters to be readed
     * @return the characters readed
     * @throws EOFException if there is no valid character left
     */
    private String getChars(int n) throws EOFException
    {
        try
        {
            char[] c = new char[n];
            source.get(c);
            return new String(c);
        }
        catch (BufferUnderflowException e)
        {
            throw new EOFException();
        }
    }

    /**
    * Reads a string from current position. The escape symbol is replaced with corresponding character.
    * @param quote the string delimiter ('"' or '\'')
    * @return the string readed
    * @throws InvalidJSONSyntaxException if the syntax of JSON string is invalid
     */
    private String nextString(char quote) throws InvalidJSONSyntaxException
    {
        StringBuffer result = new StringBuffer();
        while (source.hasRemaining())
        {
            char c = source.get();
            switch (c)
            {
                case '\r':
                case '\n':
                {
                    throw new InvalidJSONSyntaxException("102");  // string must end with "\"" or "'"
                }
                case '"':  // end string
                case '\'':  // end string
                {
                    if (quote == c)
                    {
                        return result.toString();
                    }
                    break;
                }
                case '\\':  // process escape character
                {
                    try
                    {
                        c = source.get();
                        switch (c)
                        {
                            case 'b':
                            {
                                c = '\b';
                                break;
                            }
                            case 't':
                            {
                                c = '\t';
                                break;
                            }
                            case 'n':
                            {
                                c = '\n';
                                break;
                            }
                            case 'f':
                            {
                                c = '\f';
                                break;
                            }
                            case 'r':
                            {
                                c = '\r';
                                break;
                            }
                            case 'x':  // hexadecimal character
                            {
                                c = (char) Integer.parseInt(getChars(2), 16);
                                break;
                            }
                            case 'u':  // UNICODE character
                            {
                                c = (char) Integer.parseInt(getChars(4), 16);
                                break;
                            }
                            case '\\':
                            {
                                c = '\\';
                                break;
                            }
                            case '"':
                            {
                                c = '"';
                                break;
                            }
                            default:
                            {
                                throw new InvalidJSONSyntaxException("103");  // invalid escape character
                            }
                        }
                    }
                    catch (NumberFormatException e)
                    {
                        throw new InvalidJSONSyntaxException("103");
                    }
                    catch (BufferUnderflowException e)
                    {
                        throw new InvalidJSONSyntaxException("102");
                    }
                    catch (EOFException e)
                    {
                        throw new InvalidJSONSyntaxException("102");
                    }
                }
            }
            result.append(c);
        }
        throw new InvalidJSONSyntaxException("102");
    }

    /**
     * Reads the next token from current position.
     * @return the type of token readed (eg. STRING, NUMBER, DATE and so on)
     * @throws EOFException if there is no valid character left
     * @throws InvalidJSONSyntaxException if the syntax of JSON string is invalid
     */
    public int nextToken() throws EOFException, InvalidJSONSyntaxException
    {
        source.mark();  // mark the previous position
        StringBuffer token_buf = new StringBuffer();
        try
        {
            int token_type = CHARACTERS;
            boolean continue_parse = true;
            char c;
            do
            {
                c = nextChar();
                switch (c)
                {
                    case '"':
                    case '\'':
                    {
                        token_text = nextString(c);
//                        logger.info("The next token: " + token_text);
                        return STRING;
                    }
                    case '{':
                    {
                        token_type = START_OBJECT;
                        continue_parse = false;
                        break;
                    }
                    case '}':
                    {
                        token_type = END_OBJECT;
                        continue_parse = false;
                        break;
                    }
                    case '[':
                    {
                        token_type = START_ARRAY;
                        continue_parse = false;
                        break;
                    }
                    case ']':
                    {
                        token_type = END_ARRAY;
                        continue_parse = false;
                        break;
                    }
                    case ',':
                    {
                        token_type = COMMA;
                        continue_parse = false;
                        break;
                    }
                    case ':':
                    {
                        token_type = COLON;
                        continue_parse = false;
                        break;
                    }
                    default:
                    {
                        // stop reading character when there is bracket, slash, invisible character and so on
                        continue_parse = ";()/\\=".indexOf(c) < 0 && c > ' ';
                        if (continue_parse)
                        {
                            token_buf.append(c);
                        }
                    }
                }
            }
            while (continue_parse);
            if (token_buf.length() > 0)  // get a sequence of characters
            {
                source.position(source.position() - 1);  // back to last character
            }
            else  // comma, bracket, slash or invisible character and so on
            {
                token_text = token_buf.append(c).toString();
//                logger.info("The next token: " + token_text);
                return token_type;
            }
        }
        catch (EOFException e)
        {
            if (token_buf.length() == 0)
            {
                throw e;
            }
        }
        // return the characters readed
        token_text = token_buf.toString();
//        logger.info("The next token: " + token_text);
        return CHARACTERS;
    }

    public boolean isNull()
    {
        return "null".equalsIgnoreCase(token_text);
    }

    public boolean isNumber()
    {
        return number_pattern.matcher(token_text).matches();
    }

    public boolean isBooleanTrue()
    {
        return "true".equalsIgnoreCase(token_text);
    }

    public boolean isBooleanFalse()
    {
        return "false".equalsIgnoreCase(token_text);
    }

    public boolean isDate()
    {
        boolean result = date_pattern.matcher(token_text).matches();
        if (result)
        {
            token_text = token_text.substring(1);
        }
        return result;
    }

    /**
     * Returns the token text readed.
     * @return the token text readed
     */
    public String getTokenText()
    {
        return token_text;
    }

    public static void main(String[] args)
    {
        try
        {
            String str = "{" +
                         "  'a': 2," +
                         "  \"b\": \" w/{}\\nwee\"," +
                         "  'c': [1,2,3,4]," +
                         "  \"d\": " +
                         "  [" +
                         "      {" +
                         "          'a':2," +
                         "          'b':''" +
                         "      }" +
                         "  ]" +
                         "}";
            Tokener tokener = new Tokener(CharBuffer.wrap(str));
            while (true)
            {
                System.out.println(tokener.nextToken() + "\t" + tokener.getTokenText());
            }
        }
        catch (EOFException e)
        {
        }
        catch (InvalidJSONSyntaxException e)
        {
            e.printStackTrace();
        }
    }
}
