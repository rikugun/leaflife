package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Double object and JSON string.
 * @author huangchao
 */
public class DoubleSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {double.class, Double.class};

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
                    return new Double(json.getTokenText());
                }
                else if (json.isBooleanTrue())
                {
                    return new Double(1);
                }
                else if (json.isBooleanFalse())
                {
                    return new Double(0);
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("207");  // can not convert JSON string to double object
    }
}
