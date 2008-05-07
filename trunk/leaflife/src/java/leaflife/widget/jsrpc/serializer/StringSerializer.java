package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;
import java.util.regex.Pattern;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to String object and JSON string.
 * @author huangchao
 */
public class StringSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {String.class};
    private Pattern back_slash = Pattern.compile("\\\\");
    private Pattern backspace = Pattern.compile("\b");
    private Pattern tab = Pattern.compile("\t");
    private Pattern new_line = Pattern.compile("\n");
    private Pattern form_feed = Pattern.compile("\f");
    private Pattern carriage_return = Pattern.compile("\r");
    private Pattern double_quote = Pattern.compile("\"");

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        String str = obj.toString();
        str = back_slash.matcher(str).replaceAll("\\\\\\\\");
        str = backspace.matcher(str).replaceAll("\\\\b");
        str = tab.matcher(str).replaceAll("\\\\t");
        str = new_line.matcher(str).replaceAll("\\\\n");
        str = form_feed.matcher(str).replaceAll("\\\\f");
        str = carriage_return.matcher(str).replaceAll("\\\\r");
        str = double_quote.matcher(str).replaceAll("\\\\\"");
        return new StringBuffer("\"").append(str).append("\"").toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            switch (json.nextToken())
            {
                case Tokener.CHARACTERS:
                {
                    if (! json.isNumber())
                    {
                        break;
                    }
                }
                case Tokener.STRING:
                {
                    return json.getTokenText();
                }
            }
        }
        catch (EOFException e)
        {
        }
        throw new UnmarshallException("213");  // can not convert JSON string to string object
    }
}
