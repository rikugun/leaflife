package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Boolean object and JSON string.
 * @author huangchao
 */
public class BooleanSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {boolean.class, Boolean.class};

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            if (json.nextToken() == Tokener.CHARACTERS)
            {
                if (json.isNumber())
                {
                    return new Boolean(! "0".equals(json.getTokenText()));  // return false if equals 0
                }
                else if (json.isBooleanTrue())
                {
                    return new Boolean(true);
                }
                else if (! json.isDate())  // number or null
                {
                    return new Boolean(false);
                }
            }
        }
        catch (EOFException e)
        {
        }
        throw new UnmarshallException("202");  // can not convert JSON string to boolean object
    }
}
